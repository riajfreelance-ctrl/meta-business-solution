const { db } = require('./server/services/firestoreService');

async function listDrafts() {
    console.log("Listing last 5 draft_replies:");
    const snap = await db.collection("draft_replies")
        .orderBy("timestamp", "desc")
        .limit(5)
        .get();
    
    snap.docs.forEach(doc => {
        const d = doc.data();
        console.log(`- ID: ${doc.id}`);
        console.log(`  Brand: ${d.brandId}`);
        console.log(`  Status: ${d.status}`);
        console.log(`  Type: ${d.type}`);
        console.log(`  Keyword: ${d.keyword}`);
        console.log(`  Result: ${d.result}`);
        console.log(`  Timestamp: ${d.timestamp?.toDate ? d.timestamp.toDate() : d.timestamp}`);
        console.log("---");
    });
}

listDrafts().catch(err => console.error(err));
