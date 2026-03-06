import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration for Online Haat
const firebaseConfig = {
  apiKey: "AIzaSyBoeVKBpVaVcfiEoreiZaPyj_9HLBVE62SK6",
  authDomain: "online-hat-kp-community.firebaseapp.com",
  projectId: "online-hat-kp-community",
  storageBucket: "online-hat-kp-community.firebasestorage.app",
  messagingSenderId: "776997026417",
  appId: "1:776997026417:web:fc8ea201ae8d7cbd6db9d0",
  measurementId: "G-HLBVE62SK6"
};

// Initialize Firebase with a unique name to avoid conflicts
const onlineHaatApp = initializeApp(firebaseConfig, "onlineHaatApp");

// Initialize Firestore and export
export const onlineHaatDb = initializeFirestore(onlineHaatApp, {
  experimentalForceLongPolling: true,
});
