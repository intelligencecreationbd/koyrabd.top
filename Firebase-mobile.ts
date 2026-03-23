import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase with a unique name to avoid conflicts
const mobileApp = initializeApp(firebaseConfig, "mobileApp");

// Initialize Firestore and export
export const mobileDb = initializeFirestore(mobileApp, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
