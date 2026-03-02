import express from "express";
import { createServer as createViteServer } from "vite";
import cors from "cors";
import dotenv from "dotenv";
import { BetaAnalyticsDataClient } from "@google-analytics/data";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Analytics Proxy Endpoint
app.get("/api/analytics", async (req, res) => {
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

    // 3. Validation & Mock Fallback
    const isInvalid = !propertyId || !clientEmail || !privateKey || !privateKey.includes('BEGIN PRIVATE KEY');
    
    if (isInvalid) {
      const missing = [];
      if (!propertyId) missing.push("GA_PROPERTY_ID");
      if (!clientEmail) missing.push("GA_CLIENT_EMAIL");
      if (!privateKey || !privateKey?.includes('BEGIN PRIVATE KEY')) missing.push("GA_PRIVATE_KEY (invalid format)");
      
      console.warn(`Analytics credentials missing or invalid: ${missing.join(', ')}. Returning mock data.`);
      return res.json({
        totalVisitors: 12450,
        activeUsers: 42 + Math.floor(Math.random() * 5),
        todayVisitors: 850 + Math.floor(Math.random() * 20),
        topPages: [
          { page: 'হটলাইন', hits: '৫.২k', val: 5200 },
          { page: 'আবহাওয়া', hits: '৪.৮k', val: 4800 },
          { page: 'ডিজিটাল খাতা', hits: '৪.৫k', val: 4500 },
          { page: 'বাস', hits: '৪.২k', val: 4200 },
          { page: 'জনপ্রতিনিধি', hits: '৩.৯k', val: 3900 },
          { page: 'মোবাইল নাম্বার', hits: '৩.৬k', val: 3600 },
          { page: 'অনলাইন হাট', hits: '৩.৩k', val: 3300 },
          { page: 'কেপি পোস্ট', hits: '৩.০k', val: 3000 },
          { page: 'কেপি চ্যাট', hits: '২.৭k', val: 2700 },
          { page: 'আইনি সেবা', hits: '২.৪k', val: 2400 },
          { page: 'চিকিৎসা সেবা', hits: '২.১k', val: 2100 },
          { page: 'ঐতিহ্য', hits: '১.৮k', val: 1800 },
          { page: 'বয়স ক্যালকুলেটর', hits: '১.৫k', val: 1500 }
        ],
        isMock: true,
        debug: `Missing/Invalid: ${missing.join(', ')}`
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
