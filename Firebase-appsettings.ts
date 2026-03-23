import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration for App Settings (Admin Password, App Logo)
const firebaseConfig = {
  apiKey: "AIzaSyDSdWrA0OE7AbtSGnKQDyERKaJMCzwxY1M",
  authDomain: "user-auth-and-app-setting-kp.firebaseapp.com",
  projectId: "user-auth-and-app-setting-kp",
  storageBucket: "user-auth-and-app-setting-kp.firebasestorage.app",
  messagingSenderId: "367160662510",
  appId: "1:367160662510:web:6d595bb0f95641f91156ff",
  measurementId: "G-6W2GMREZ3W"
};

// Initialize Firebase with a unique name to avoid conflicts with other instances
const app = initializeApp(firebaseConfig, "appsettings");
export const settingsDb = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
