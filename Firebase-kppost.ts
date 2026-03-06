import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";

// Firebase configuration for KP Post
const firebaseConfig = {
  apiKey: "AIzaSyDs3_ilxVNBqMheWp_3_8Xf_e-bnB0XB7k",
  authDomain: "kp-post-kp-community.firebaseapp.com",
  projectId: "kp-post-kp-community",
  storageBucket: "kp-post-kp-community.firebasestorage.app",
  messagingSenderId: "425504353426",
  appId: "1:425504353426:web:51c0847134324adc264a4b",
  measurementId: "G-Z47JLHBKP5"
};

// Initialize Firebase with a unique name
const app = initializeApp(firebaseConfig, "kppost");
export const kppostDb = initializeFirestore(app, {
  experimentalForceLongPolling: true,
});
