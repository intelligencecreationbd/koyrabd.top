import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import firebaseConfig from './firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
