import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration
// Note: Replace placeholders with actual values from your Firebase project settings
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "user-d2031.firebaseapp.com",
  databaseURL: "https://user-d2031-default-rtdb.asia-southeast1.firebasedatabase.app/",
  projectId: "user-d2031",
  storageBucket: "user-d2031.firebasestorage.app",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
