import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration for KP Post
const firebaseConfig = {
  apiKey: "AIzaSyBopuqneuSyLAHAmFpPozXZV1PMUa55mbo",
  authDomain: "kp-post.firebaseapp.com",
  databaseURL: "https://kp-post-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kp-post",
  storageBucket: "kp-post.firebasestorage.app",
  messagingSenderId: "842811034824",
  appId: "1:842811034824:web:08fd9be58202f1725069fd",
  measurementId: "G-7X56LDY5ZT"
};

// Initialize Firebase with a unique name
const app = initializeApp(firebaseConfig, "kppost");
export const kppostDb = getDatabase(app);
