import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

export const firebaseConfig = {
  apiKey: "AIzaSyCJ-TGT6jZLMdq0eWH-ZCacouYx-xNBTFA",
  authDomain: "averqonbill.firebaseapp.com",
  projectId: "averqonbill",
  storageBucket: "averqonbill.firebasestorage.app",
  messagingSenderId: "1022083440931",
  appId: "1:1022083440931:web:b811bfc1519675dcaf2c96",
  measurementId: "G-BJ6M4KLF4T"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);

export default app;
