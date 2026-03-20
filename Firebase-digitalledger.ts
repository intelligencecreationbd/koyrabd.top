
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB-yoviM2TjxhdFHnkt7SzDofNT52UUOgQ",
  authDomain: "digital-khata-kp-community.firebaseapp.com",
  projectId: "digital-khata-kp-community",
  storageBucket: "digital-khata-kp-community.firebasestorage.app",
  messagingSenderId: "405360440523",
  appId: "1:405360440523:web:d6bf83e0a5ea1267a3174e",
  measurementId: "G-SRJQSNZXJS"
};

// Initialize Firebase for Digital Ledger
const ledgerApp = initializeApp(firebaseConfig, "digitalLedger");
export const ledgerDb = initializeFirestore(ledgerApp, {
  experimentalForceLongPolling: true,
});
