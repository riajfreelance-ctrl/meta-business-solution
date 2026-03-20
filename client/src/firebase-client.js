import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBfGtLofGKrYIXO8Jw1caphsuN014HHiLA",
  authDomain: "advance-automation-8029e.firebaseapp.com",
  projectId: "advance-automation-8029e",
  storageBucket: "advance-automation-8029e.firebasestorage.app",
  messagingSenderId: "240143294821",
  appId: "1:240143294821:web:70b101bf7192f4932d018c",
  measurementId: "G-9KT4LQKFEX"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
