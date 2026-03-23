import { ref, get, update, increment, serverTimestamp } from "firebase/database";
import { db } from "../firebase";

export const trackVisit = async () => {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const monthStr = dateStr.substring(0, 7); // YYYY-MM

  const updates: any = {};
  
  // Increment total visits
  updates['analytics/totalVisits'] = increment(1);
  
  // Increment daily visits
  updates[`analytics/daily/${dateStr}`] = increment(1);
  
  // Increment monthly visits
  updates[`analytics/monthly/${monthStr}`] = increment(1);
  
  // Update last visit timestamp
  updates['analytics/lastVisit'] = serverTimestamp();

  try {
    await update(ref(db), updates);
  } catch (error) {
    console.error("Error tracking visit:", error);
  }
};

export const getVisitorStats = async () => {
  try {
    const snapshot = await get(ref(db, 'analytics'));
    if (snapshot.exists()) {
      return snapshot.val();
    }
    return {
      totalVisits: 0,
      daily: {},
      monthly: {},
      lastVisit: null
    };
  } catch (error) {
    console.error("Error fetching visitor stats:", error);
    return null;
  }
};
