// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDuYj9StJwnytFR-tYd1BLs3nqqplaZ0Ik",
  authDomain: "galilee-60b24.firebaseapp.com",
  projectId: "galilee-60b24",
  storageBucket: "galilee-60b24.firebasestorage.app",
  messagingSenderId: "804091013860",
  appId: "1:804091013860:web:96c1296214dc7264279af1",
  measurementId: "G-TMGB6V16NG",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const analytics = getAnalytics(app);

export default app;
