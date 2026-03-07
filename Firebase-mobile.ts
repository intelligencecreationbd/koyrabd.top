import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration for Mobile Number Service (Official Contact KP Community)
const firebaseConfig = {
  apiKey: "AIzaSyCRD3Oe6e_ztdLONuXfogxadMHgbzD4iYU",
  authDomain: "official-contact-kp-community.firebaseapp.com",
  projectId: "official-contact-kp-community",
  storageBucket: "official-contact-kp-community.firebasestorage.app",
  messagingSenderId: "558794553092",
  appId: "1:558794553092:web:b4cce007f9e217e1bcc251",
  measurementId: "G-17M32QEW7V"
};

// Initialize Firebase with a unique name to avoid conflicts
const mobileApp = initializeApp(firebaseConfig, "mobileApp");

// Initialize Firestore and export
export const mobileDb = initializeFirestore(mobileApp, {
  experimentalForceLongPolling: true,
});
