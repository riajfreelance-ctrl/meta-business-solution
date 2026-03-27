const { db } = require('./services/firestoreService');
const { getEmbedding } = require('./services/embeddingService');

async function migrate() {
    console.log("🚀 Starting Vector Migration...");
    
    try {
        // 1. Migrate Products
        console.log("--- Migrating Products ---");
        const productSnap = await db.collection('products').get();
        let pCount = 0;
        for (const doc of productSnap.docs) {
            const data = doc.data();
            if (!data.embedding) {
                const text = `${data.name} ${data.description || ''} ${data.category || ''}`;
                const embedding = await getEmbedding(text);
                await doc.ref.update({ embedding });
                console.log(`✅ Updated product: ${data.name}`);
                pCount++;
            }
        }
        console.log(`Total products updated: ${pCount}`);

        // 2. Migrate Knowledge Base
        console.log("--- Migrating Knowledge Base ---");
        const kbSnap = await db.collection('knowledge_base').get();
        let kCount = 0;
        for (const doc of kbSnap.docs) {
            const data = doc.data();
            if (!data.embedding) {
                const text = `${data.question || ''} ${data.answer || ''} ${data.keywords?.join(' ') || ''}`;
                const embedding = await getEmbedding(text);
                await doc.ref.update({ embedding });
                console.log(`✅ Updated KB: ${data.question || 'Snippet'}`);
                kCount++;
            }
        }
        console.log(`Total KB items updated: ${kCount}`);

        console.log("🎉 Migration Complete!");
        process.exit(0);
    } catch (error) {
        console.error("❌ Migration Failed:", error.message);
        process.exit(1);
    }
}

migrate();
