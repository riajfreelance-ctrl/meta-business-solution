import { initializeApp } from "firebase/app";
import { getFirestore, disableNetwork, enableIndexedDbPersistence, enableMultiTabIndexedDbPersistence } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBfGtLofGKrYIXO8Jw1caphsuN014HHiLA",
  authDomain: "advance-automation-8029e.firebaseapp.com",
  projectId: "advance-automation-8029e",
  storageBucket: "advance-automation-8029e.firebasestorage.app",
  messagingSenderId: "240143294821",
  appId: "1:240143294821:web:70b101bf7192f4932d018c"
  // Removed measurementId to disable Analytics and prevent Image() constructor crash
};

// Initialize Firebase without Analytics
const app = initializeApp(firebaseConfig);

// Initialize Firestore
const db = getFirestore(app);

export { db };

let storage;
try {
  storage = getStorage(app);
} catch (e) {
  console.error("Firebase Storage failed to initialize. Make sure it is enabled in the Firebase Console.", e);
  storage = null;
}
export { storage };
