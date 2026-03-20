import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration for Legal Services (using Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyD5dX6XONIFI0dR4v0VAG-tH05UuBiLuuc",
  authDomain: "law-kp-community.firebaseapp.com",
  projectId: "law-kp-community",
  storageBucket: "law-kp-community.firebasestorage.app",
  messagingSenderId: "42137712040",
  appId: "1:42137712040:web:dce3516d678653a88e599d",
  measurementId: "G-XWCCW9X9GD"
};

// Initialize Firebase with a unique name
const app = initializeApp(firebaseConfig, "lawApp");
export const lawDb = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
