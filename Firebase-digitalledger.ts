
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyAhnnKCqDr04rxOZBeBI2D_VLXpKGwsinw",
  authDomain: "digital-khata-342a9.firebaseapp.com",
  databaseURL: "https://digital-khata-342a9-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "digital-khata-342a9",
  storageBucket: "digital-khata-342a9.firebasestorage.app",
  messagingSenderId: "1080026723662",
  appId: "1:1080026723662:web:6295dd0543452459a41a1f",
  measurementId: "G-GC7HVN3J7R"
};

// Initialize Firebase for Digital Ledger
const ledgerApp = initializeApp(firebaseConfig, "digitalLedger");
export const ledgerDb = getDatabase(ledgerApp);
