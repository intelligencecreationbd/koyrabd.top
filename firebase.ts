import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCHuA1I4krz9VqBSvZfx45MPiGL9u-JF3c",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "appsettings-60fa1.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://appsettings-60fa1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "appsettings-60fa1",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "appsettings-60fa1.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "596039947664",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:596039947664:web:681c687e3c99b5036fcf15",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-9HYLN088W7"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
