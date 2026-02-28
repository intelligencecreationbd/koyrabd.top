import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Firebase configuration for KP Chat (using Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyCwgO5mesHKj0h8Br6gfiB5AQy7cCbaD4s",
  authDomain: "kp-chat-f2148.firebaseapp.com",
  projectId: "kp-chat-f2148",
  storageBucket: "kp-chat-f2148.firebasestorage.app",
  messagingSenderId: "698896937644",
  appId: "1:698896937644:web:190dc3a3dc5c279bdb2509",
  measurementId: "G-97Y7ELYFKJ"
};

// Initialize Firebase with a unique name
const app = initializeApp(firebaseConfig, "kpchat");
export const chatDb = getFirestore(app);
