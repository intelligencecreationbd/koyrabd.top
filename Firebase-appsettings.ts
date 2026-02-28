import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration for App Settings (Admin Password, App Logo)
const firebaseConfig = {
  apiKey: "AIzaSyCHuA1I4krz9VqBSvZfx45MPiGL9u-JF3c",
  authDomain: "appsettings-60fa1.firebaseapp.com",
  databaseURL: "https://appsettings-60fa1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "appsettings-60fa1",
  storageBucket: "appsettings-60fa1.firebasestorage.app",
  messagingSenderId: "596039947664",
  appId: "1:596039947664:web:681c687e3c99b5036fcf15",
  measurementId: "G-9HYLN088W7"
};

// Initialize Firebase with a unique name to avoid conflicts with other instances
const app = initializeApp(firebaseConfig, "appsettings");
export const settingsDb = getDatabase(app);
