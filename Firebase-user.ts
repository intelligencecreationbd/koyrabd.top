
import { initializeApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import firebaseConfig from './firebase-applet-config.json';

const app = initializeApp(firebaseConfig, "userApp");
export const userDb = initializeFirestore(app, {
  experimentalForceLongPolling: true,
}, firebaseConfig.firestoreDatabaseId);
export const userAuth = getAuth(app);
export const userStorage = getStorage(app);
