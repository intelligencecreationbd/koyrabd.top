import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration for Bus Service
const firebaseConfig = {
  apiKey: "AIzaSyA0_bF13sGwGv1Q4uPVQi86RV07j4iF_UA",
  authDomain: "bus-kp-community-2edb9.firebaseapp.com",
  projectId: "bus-kp-community-2edb9",
  storageBucket: "bus-kp-community-2edb9.firebasestorage.app",
  messagingSenderId: "106381232793",
  appId: "1:106381232793:web:7146014c93921ed84e8608",
  measurementId: "G-47L3EWZ5XK"
};

// Initialize Firebase with a unique name to avoid conflicts
const busApp = initializeApp(firebaseConfig, "busApp");

// Initialize Firestore and export
export const busDb = initializeFirestore(busApp, {
  experimentalForceLongPolling: true,
});
