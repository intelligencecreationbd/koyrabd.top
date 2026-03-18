import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import { BetaAnalyticsDataClient } from "@google-analytics/data";
import fs from 'fs';
import path from 'path';
import { doc, getDoc } from "firebase/firestore";
import { kppostDb } from "./Firebase-kppost";

dotenv.config();

const app = express();
const PORT = 3000;

app.set('trust proxy', true);
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
  const host = req.get('host');
  if (host && host.includes('getapp.koyrabd.top')) {
    if (req.path === '/') {
      return res.redirect('/getapp');
    }
  }

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

// --- News Image Proxy for Social Media (Handles Base64) ---
app.get("/news-image/:id", async (req, res) => {
  const newsId = req.params.id;
  try {
    const newsDoc = await getDoc(doc(kppostDb, "news_main", newsId));
    if (newsDoc.exists() && newsDoc.data().photo) {
      const photoData = newsDoc.data().photo;
      if (photoData.startsWith('data:image')) {
        const matches = photoData.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          const type = matches[1];
          const buffer = Buffer.from(matches[2], 'base64');
          res.set('Content-Type', type);
          res.set('Cache-Control', 'public, max-age=86400'); // Cache for 24 hours
          return res.send(buffer);
        }
      }
    }
    // Fallback to default logo
    res.redirect("https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png");
  } catch (error) {
    res.redirect("https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png");
  }
});

// --- News Share Route for Social Media Previews ---
app.get("/news/:id", async (req, res) => {
  const newsId = req.params.id;
  try {
    const newsDoc = await getDoc(doc(kppostDb, "news_main", newsId));
    if (newsDoc.exists()) {
      const news = newsDoc.data();
      const title = news.title || "সংবাদ - কয়রা-পাইকগাছা";
      const rawDescription = news.description || "";
      const cleanDescription = rawDescription.replace(/\n/g, ' ').substring(0, 160);
      const description = cleanDescription.length < rawDescription.length ? `${cleanDescription}...` : cleanDescription || "কয়রা-পাইকগাছা কমিউনিটি অ্যাপস";
      
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const host = req.get('host');
      const baseUrl = `${protocol}://${host}`;
      
      // Use the proxy route for the image
      const imageUrl = `${baseUrl}/news-image/${newsId}`;
      const shareUrl = `${baseUrl}/news/${newsId}`;
      const appRedirectUrl = `${baseUrl}/category/14?newsId=${newsId}`;

      res.send(`
        <!DOCTYPE html>
        <html lang="bn">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          
          <!-- Primary Meta Tags -->
          <title>${title}</title>
          <meta name="title" content="${title}">
          <meta name="description" content="${description}">

          <!-- Open Graph / Facebook -->
          <meta property="og:title" content="${title}">
          <meta property="og:description" content="${description}">
          <meta property="og:image" content="${imageUrl}">
          <meta property="og:image:secure_url" content="${imageUrl}">
          <meta property="og:image:type" content="image/jpeg">
          <meta property="og:image:width" content="1200">
          <meta property="og:image:height" content="630">
          <meta property="og:url" content="${shareUrl}">
          <meta property="og:type" content="article">
          <meta property="og:site_name" content="কয়রা-পাইকগাছা কমিউনিটি অ্যাপস">

          <!-- Twitter -->
          <meta name="twitter:card" content="summary_large_image">
          <meta name="twitter:url" content="${shareUrl}">
          <meta name="twitter:title" content="${title}">
          <meta name="twitter:description" content="${description}">
          <meta name="twitter:image" content="${imageUrl}">

          <link rel="icon" href="https://raw.githubusercontent.com/StackBlitz-User-Assets/logo/main/kp-logo.png">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f0f2f5; color: #1c1e21; text-align: center; padding: 20px; }
            .loader { border: 4px solid #f3f3f3; border-top: 4px solid #1877f2; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin-bottom: 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h1 { font-size: 1.5rem; margin-bottom: 10px; color: #1877f2; }
            p { color: #65676b; font-weight: 500; }
          </style>
          <script>
            setTimeout(function() {
              window.location.href = "${appRedirectUrl}";
            }, 500);
          </script>
        </head>
        <body>
          <div class="loader"></div>
          <h1>${title}</h1>
          <p>সংবাদটি লোড হচ্ছে, দয়া করে অপেক্ষা করুন...</p>
        </body>
        </html>
      `);
      return;
    } else {
      const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
      const host = req.get('host');
      res.redirect(`${protocol}://${host}`);
    }
  } catch (error) {
    console.error("Share error:", error);
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host');
    res.redirect(`${protocol}://${host}`);
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== "production") {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "spa",
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
