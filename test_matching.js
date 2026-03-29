const { db } = require('./server/services/firestoreService');
const Fuse = require('fuse.js');
const { normalizePhonetic, cleanNoise } = require('./server/utils/linguisticEngine');

async function testUnifiedMatch(message, brandId) {
    console.log(`Testing UNIFIED match for: "${message}" in Brand: ${brandId}`);
    
    const [draftSnap, kbSnap] = await Promise.all([
        db.collection("draft_replies")
            .where("brandId", "==", brandId)
            .where("status", "==", "approved")
            .get(),
        db.collection("knowledge_base")
            .where("brandId", "==", brandId)
            .get()
    ]);
    
    console.log(`Found ${draftSnap.size} approved drafts and ${kbSnap.size} KB rules.`);

    const searchableRecords = [];
    
    draftSnap.docs.forEach(doc => {
        const d = doc.data();
        const allPhrases = new Set([d.keyword, ...(d.variations || []), ...(d.approvedVariations || []), normalizePhonetic(d.keyword)]);
        allPhrases.forEach(phrase => {
            if (phrase) searchableRecords.push({ phrase, result: d.result, type: 'draft' });
        });
    });

    kbSnap.docs.forEach(doc => {
        const d = doc.data();
        const allPhrases = new Set([...(d.keywords || []), ...(d.keywords ? d.keywords.map(kw => normalizePhonetic(kw)) : [])]);
        allPhrases.forEach(phrase => {
            if (phrase) searchableRecords.push({ phrase, result: d.answer, type: 'kb' });
        });
    });

    if (searchableRecords.length === 0) {
        console.log("No searchable records.");
        return;
    }

    const fuse = new Fuse(searchableRecords, {
        keys: ['phrase'],
        includeScore: true,
        threshold: 0.35
    });

    let results = fuse.search(message);
    if (results.length > 0) {
        console.log(`Matched! Type: ${results[0].item.type}, Phrase: ${results[0].item.phrase}, Score: ${results[0].score}`);
        console.log(`Result: ${results[0].item.result}`);
    } else {
        console.log("No match found.");
    }
}

testUnifiedMatch("price", "Azlaan").catch(console.error);
