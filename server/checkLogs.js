const admin = require('firebase-admin');

// Since we can't easily read console logs, let's write a script that mocks the exact query
// to see if it throws an error.
const { getFirestore, collection, query, orderBy, limit, getDocs } = require('firebase/firestore');
const { initializeApp } = require('firebase/app');

// Using the same config as firestoreService.js
const firebaseConfig = {
    apiKey: "AIzaSyBfGtLofGKrYIXO8Jw1caphsuN014HHiLA",
    authDomain: "advance-automation-8029e.firebaseapp.com",
    projectId: "advance-automation-8029e",
    storageBucket: "advance-automation-8029e.firebasestorage.app",
    messagingSenderId: "240143294821",
    appId: "1:240143294821:web:70b101bf7192f4932d018c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testQuery() {
    try {
        console.log("Testing conversations/123/messages query...");
        const sender_psid = "123456789"; // Dummy
        const historySnap = await getDocs(query(
            collection(db, `conversations/${sender_psid}/messages`), 
            orderBy('timestamp', 'desc'), 
            limit(5)
        ));
        console.log("SUCCESS:", historySnap.size, "docs found.");
    } catch (e) {
        console.log("ERROR:", e.message);
    }
    process.exit(0);
}

testQuery();
