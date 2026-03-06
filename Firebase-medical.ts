import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration for Medical Services (using Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyB14qEvvKHZh9LHNTaN0LxkHmgHr2xW9Ks",
  authDomain: "medical-kp-community.firebaseapp.com",
  projectId: "medical-kp-community",
  storageBucket: "medical-kp-community.firebasestorage.app",
  messagingSenderId: "74716257654",
  appId: "1:74716257654:web:c99413e457ca1e0a88ee57",
  measurementId: "G-JYPXJN1449"
};

// Initialize Firebase with a unique name
const app = initializeApp(firebaseConfig, "medicalApp");
export const medicalDb = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
