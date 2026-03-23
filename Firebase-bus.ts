import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase with a unique name to avoid conflicts
const busApp = initializeApp(firebaseConfig, "busApp");

// Initialize Firestore and export
export const busDb = initializeFirestore(busApp, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
