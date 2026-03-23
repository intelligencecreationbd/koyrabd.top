
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDSdWrA0OE7AbtSGnKQDyERKaJMCzwxY1M",
  authDomain: "user-auth-and-app-setting-kp.firebaseapp.com",
  projectId: "user-auth-and-app-setting-kp",
  storageBucket: "user-auth-and-app-setting-kp.firebasestorage.app",
  messagingSenderId: "367160662510",
  appId: "1:367160662510:web:6d595bb0f95641f91156ff",
  measurementId: "G-6W2GMREZ3W"
};

const app = initializeApp(firebaseConfig, "userApp");
export const userDb = getFirestore(app);
export const userAuth = getAuth(app);
export const userStorage = getStorage(app);
