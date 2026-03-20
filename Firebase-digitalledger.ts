
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase for Digital Ledger
const ledgerApp = initializeApp(firebaseConfig, "digitalLedger");
export const ledgerDb = initializeFirestore(ledgerApp, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
