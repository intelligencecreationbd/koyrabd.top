import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase configuration for Directory Service
const firebaseConfig = {
  apiKey: "AIzaSyBlI1bsM_PnSlikgXDPLgSs6fQMHKC0Eug",
  authDomain: "directory-service-cab36.firebaseapp.com",
  databaseURL: "https://directory-service-cab36-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "directory-service-cab36",
  storageBucket: "directory-service-cab36.firebasestorage.app",
  messagingSenderId: "49731022784",
  appId: "1:49731022784:web:380ff16e9e7baebb2fa225",
  measurementId: "G-QN0QN2VER9"
};

// Initialize Firebase with a unique name to avoid conflicts
const directoryApp = initializeApp(firebaseConfig, "directoryApp");

// Initialize Realtime Database and export
export const directoryDb = getDatabase(directoryApp);

/**
 * স্যাম্পল কোড (কিভাবে ডাটা কল করবেন):
 * 
 * import { ref, onValue } from "firebase/database";
 * import { directoryDb } from "../Firebase-directory";
 * 
 * // হটলাইন ডাটা কল করা
 * const hotlineRef = ref(directoryDb, 'হটলাইন');
 * onValue(hotlineRef, (snapshot) => {
 *   const data = snapshot.val();
 *   console.log("Hotline Data:", data);
 * });
 * 
 * // অন্যান্য নোডগুলো একইভাবে কল করা যাবে:
 * // ref(directoryDb, 'বাস')
 * // ref(directoryDb, 'জনপ্রতিনিধি')
 * // ref(directoryDb, 'মোবাইল নাম্বার')
 * // ref(directoryDb, 'আইনি সেবা')
 * // ref(directoryDb, 'চিকিৎসা সেবা')
 */
