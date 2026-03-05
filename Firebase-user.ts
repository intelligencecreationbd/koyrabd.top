
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAaZ5eBjJPCFOUn7A8pDknKss7dX3zKYp4",
  authDomain: "user-d2031.firebaseapp.com",
  databaseURL: "https://user-d2031-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "user-d2031",
  storageBucket: "user-d2031.firebasestorage.app",
  messagingSenderId: "297820380829",
  appId: "1:297820380829:web:d856465552d22d2fafbe74",
  measurementId: "G-S9NYMCPZH8"
};

const app = initializeApp(firebaseConfig, "userApp");
export const userDb = getDatabase(app);
export const userAuth = getAuth(app);
export const userStorage = getStorage(app);
