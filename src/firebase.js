// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBfCNcB9kF50iMGBglnX6WsnOPWlZ0R2es",
  authDomain: "twoblog-a7ec5.firebaseapp.com",
  projectId: "twoblog-a7ec5",
  storageBucket: "twoblog-a7ec5.appspot.com",
  messagingSenderId: "172109593273",
  appId: "1:172109593273:web:e0664358d7e824d3857968",
  measurementId: "G-K0TZD3V681",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const db = getFirestore(app);
export const auth = getAuth(app);
import {
  doc,
  getDoc,
  query,
  collection,
  orderBy,
  where,
  limit,
  getDocs,
} from "firebase/firestore";
const firebase = {
  doc,
  getDoc,
  query,
  collection,
  orderBy,
  where,
  limit,
  getDocs,
};
export default firebase;
