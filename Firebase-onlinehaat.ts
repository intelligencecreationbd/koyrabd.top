import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase with a unique name to avoid conflicts
const onlineHaatApp = initializeApp(firebaseConfig, "onlineHaatApp");

// Initialize Firestore and export
export const onlineHaatDb = initializeFirestore(onlineHaatApp, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
