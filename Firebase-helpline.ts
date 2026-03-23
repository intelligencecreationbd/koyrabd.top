import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for Help Line (app-tools-kp)
const firebaseConfig = {
  apiKey: "AIzaSyAGUJhOhWqD4sV44hYslpMWL9B6FJ8GgWU",
  authDomain: "app-tools-kp.firebaseapp.com",
  projectId: "app-tools-kp",
  storageBucket: "app-tools-kp.firebasestorage.app",
  messagingSenderId: "579599195022",
  appId: "1:579599195022:web:0" // Note: This was the ID provided in the request
};

// Initialize Firebase with a unique name
const app = initializeApp(firebaseConfig, "helpline");
export const helplineDb = getFirestore(app);
