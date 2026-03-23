import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for Hotline Management
const firebaseConfig = {
  apiKey: "AIzaSyA-yHjVucPdZ4FVCkIZosxlWK-qvupvsPU",
  authDomain: "hotline-kp-community.firebaseapp.com",
  projectId: "hotline-kp-community",
  storageBucket: "hotline-kp-community.firebasestorage.app",
  messagingSenderId: "963392546469",
  appId: "1:963392546469:web:ff74e6ba5e89e0e83f8f4c",
  measurementId: "G-TKT3NMGKJF"
};

// Initialize Firebase with a unique name to avoid conflicts
const app = initializeApp(firebaseConfig, "hotline");
export const hotlineDb = getFirestore(app);
