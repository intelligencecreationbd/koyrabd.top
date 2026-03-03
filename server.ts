import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// --- Website Visit Tracking ---
const VISITS_FILE = path.join(process.cwd(), 'visits.json');

interface VisitData {
  total: number;
  today: { [date: string]: number };
  pages: { [page: string]: number };
  active: { [ip: string]: number };
}

function loadVisits(): VisitData {
  if (fs.existsSync(VISITS_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(VISITS_FILE, 'utf-8'));
    } catch (e) { /* ignore */ }
  }
  return { total: 0, today: {}, pages: {}, active: {} };
}

function saveVisits(data: VisitData) {
  try {
    fs.writeFileSync(VISITS_FILE, JSON.stringify(data, null, 2));
  } catch (e) { /* ignore */ }
}

let visitData = loadVisits();

// Middleware to track visits
app.use((req, res, next) => {
  // Only track main page loads, not API or static assets
  if (req.path.startsWith('/api') || req.path.includes('.') || req.method !== 'GET') {
    return next();
  }
  
  const ip = (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || 'unknown';
  const page = (req.query.p as string) || req.path;
  const date = new Date().toISOString().split('T')[0];

  visitData.total++;
  visitData.today[date] = (visitData.today[date] || 0) + 1;
  visitData.pages[page] = (visitData.pages[page] || 0) + 1;
  visitData.active[ip] = Date.now();

  // Cleanup active users (older than 5 mins)
  const now = Date.now();
  Object.keys(visitData.active).forEach(key => {
    if (now - visitData.active[key] > 300000) delete visitData.active[key];
  });

  saveVisits(visitData);
  next();
});

// Analytics Proxy Endpoint
app.get("/api/analytics", async (req, res) => {
  const date = new Date().toISOString().split('T')[0];
  const websiteStats = {
    totalVisitors: visitData.total,
    activeUsers: Object.keys(visitData.active).length,
    todayVisitors: visitData.today[date] || 0,
    topPages: Object.entries(visitData.pages)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 15)
      .map(([page, hits]) => ({
        page: page === '/' ? 'Home' : page.replace(/^\//, ''),
        hits: hits > 1000 ? (hits / 1000).toFixed(1) + 'k' : hits.toString(),
        val: hits
      }))
  };

  try {
    const propertyId = process.env.GA_PROPERTY_ID;
    let clientEmail = process.env.GA_CLIENT_EMAIL;
    let privateKey = process.env.GA_PRIVATE_KEY;

    // 1. Handle JSON input (if user pasted the whole JSON file)
    if (privateKey && privateKey.trim().startsWith('{')) {
      try {
        const json = JSON.parse(privateKey.trim());
        privateKey = json.private_key || privateKey;
        clientEmail = json.client_email || clientEmail;
      } catch (e) { /* ignore */ }
    }

    // 2. Clean Private Key
    if (privateKey) {
      privateKey = privateKey.trim()
        .replace(/^["']|["']$/g, '') // Remove quotes
        .replace(/\\n/g, '\n')       // Handle literal \n
        .split('\n')                 // Clean up each line
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .join('\n');
      
      if (privateKey && !privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        privateKey = `-----BEGIN PRIVATE KEY-----\n${privateKey}\n-----END PRIVATE KEY-----`;
      }
    }

    // 3. Validation & Fallback to Website Stats
    const isInvalid = !propertyId || !clientEmail || !privateKey || !privateKey.includes('BEGIN PRIVATE KEY');
    
    if (isInvalid) {
      return res.json({
        ...websiteStats,
        isMock: false,
        source: 'website'
      });
    }

    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey,
      },
    });

    // 1. Get Active Users (Real-time - last 30 mins)
    const [realtimeResponse] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      dimensions: [],
      metrics: [{ name: "activeUsers" }],
    });

    // 2. Get Today's Visitors and Total Visitors (Simplified for this demo)
    const [reportResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "today", endDate: "today" }, { startDate: "30daysAgo", endDate: "today" }],
      metrics: [{ name: "activeUsers" }],
      dimensions: [{ name: "date" }],
    });

    // 3. Get Top Pages
    const [pagesResponse] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate: "7daysAgo", endDate: "today" }],
      dimensions: [{ name: "pageTitle" }],
      metrics: [{ name: "activeUsers" }],
      limit: 15,
    });

    const activeUsers = realtimeResponse.rows?.[0]?.metricValues?.[0]?.value || "0";
    const todayVisitors = reportResponse.rows?.find(r => r.dimensionValues?.[0]?.value === new Date().toISOString().split('T')[0].replace(/-/g, ''))?.metricValues?.[0]?.value || "0";
    const totalVisitors = reportResponse.rows?.reduce((acc, r) => acc + parseInt(r.metricValues?.[0]?.value || "0"), 0) || 0;

    const topPages = pagesResponse.rows?.map(row => ({
      page: row.dimensionValues?.[0]?.value || "Unknown",
      hits: row.metricValues?.[0]?.value || "0",
      val: parseInt(row.metricValues?.[0]?.value || "0")
    })) || [];

    res.json({
      totalVisitors,
      activeUsers: parseInt(activeUsers),
      todayVisitors: parseInt(todayVisitors),
      topPages,
      isMock: false
    });
  } catch (error: any) {
    console.error("Analytics Error:", error);
    res.status(500).json({ error: error.message });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
