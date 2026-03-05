import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration for Mobile Number Service
const firebaseConfig = {
  apiKey: "AIzaSyD-qhWHg4G8wkKjTDeejbF3knBUBa6OeCo",
  authDomain: "kp-mobil.firebaseapp.com",
  projectId: "kp-mobil",
  databaseURL: "https://kp-mobil-default-rtdb.firebaseio.com",
  storageBucket: "kp-mobil.firebasestorage.app",
  messagingSenderId: "85870246929",
  appId: "1:85870246929:web:179299e47e2e26d05a05b0",
  measurementId: "G-F76WHPM1BL"
};

// Initialize Firebase with a unique name to avoid conflicts
const mobileApp = initializeApp(firebaseConfig, "mobileApp");

// Initialize Realtime Database and export
export const mobileDb = getDatabase(mobileApp);
