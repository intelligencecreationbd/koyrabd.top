import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration for KP Chat (using Firestore)
const firebaseConfig = {
  apiKey: "AIzaSyDnGBN3VirXdJ6I5HEd2IMFDguX4vFxfU0",
  authDomain: "kp-chat-kp-community.firebaseapp.com",
  projectId: "kp-chat-kp-community",
  storageBucket: "kp-chat-kp-community.firebasestorage.app",
  messagingSenderId: "884478986189",
  appId: "1:884478986189:web:f1a6fb66458e0691a7a684",
  measurementId: "G-6ZHRP8K7ZE"
};

// Initialize Firebase with a unique name
const app = initializeApp(firebaseConfig, "kpchat");
export const chatDb = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
