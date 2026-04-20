// Check Data Center rules for Skinzy
const { db } = require('./server/services/firestoreService');

(async () => {
  console.log('=== CHECKING DATA CENTER RULES FOR SKINZY ===\n');
  
  try {
    // 1. Check comment_data_center collection
    console.log('1. Checking comment_data_center collection...\n');
    const dataCenterSnap = await db.collection('comment_data_center').get();
    
    console.log(`Total Data Center entries: ${dataCenterSnap.size}\n`);
    
    if (dataCenterSnap.empty) {
      console.log('❌ NO DATA CENTER RULES FOUND!');
      console.log('You need to setup Data Center rules first.');
    } else {
      dataCenterSnap.docs.forEach((doc, i) => {
        const data = doc.data();
        console.log(`Entry ${i + 1}:`);
        console.log(`  ID: ${doc.id}`);
        console.log(`  Post ID: ${data.postId || 'Global/Universal'}`);
        console.log(`  Brand ID: ${data.brandId || 'Universal'}`);
        console.log(`  Is Active: ${data.isActive}`);
        console.log(`  Is Global: ${data.isGlobal}`);
        console.log(`  Questions: ${data.questions ? data.questions.length : 0}`);
        
        if (data.questions && data.questions.length > 0) {
          console.log(`  Keywords:`);
          data.questions.forEach((q, j) => {
            console.log(`    Q${j + 1}: ${q.keywords.join(', ')}`);
          });
        }
        console.log('');
      });
    }
    
    // 2. Check comment_drafts collection
    console.log('\n2. Checking comment_drafts collection...\n');
    const draftsSnap = await db.collection('comment_drafts').get();
    
    console.log(`Total draft entries: ${draftsSnap.size}\n`);
    
    if (!draftsSnap.empty) {
      draftsSnap.docs.slice(0, 3).forEach((doc, i) => {
        const data = doc.data();
        console.log(`Draft ${i + 1}:`);
        console.log(`  ID: ${doc.id}`);
        console.log(`  Brand ID: ${data.brandId}`);
        console.log(`  Keyword: ${data.keyword}`);
        console.log(`  Variations: ${data.variations ? data.variations.length : 0}`);
        console.log('');
      });
    }
    
    // 3. Check brand settings
    console.log('\n3. Checking Skinzy brand settings...\n');
    const brandSnap = await db.collection('brands')
      .where('facebookPageId', '==', '963307416870090')
      .get();
    
    if (brandSnap.empty) {
      console.log('❌ Skinzy brand not found in Firestore!');
    } else {
      const brand = brandSnap.docs[0].data();
      console.log(`Brand: ${brand.name}`);
      console.log(`Comment Settings:`);
      console.log(`  systemAutoReply: ${brand.commentSettings?.systemAutoReply !== false}`);
      console.log(`  aiReply: ${brand.commentSettings?.aiReply !== false}`);
      console.log(`  autoLike: ${brand.commentSettings?.autoLike}`);
    }
    
    // 4. Check recent comments
    console.log('\n\n4. Checking recent comments...\n');
    const commentsSnap = await db.collection('comments')
      .orderBy('timestamp', 'desc')
      .limit(5)
      .get();
    
    if (commentsSnap.empty) {
      console.log('No comments found');
    } else {
      commentsSnap.docs.forEach((doc, i) => {
        const data = doc.data();
        const time = new Date(data.timestamp?.toDate?.() || data.timestamp).toLocaleString();
        console.log(`Comment ${i + 1}:`);
        console.log(`  Time: ${time}`);
        console.log(`  From: ${data.sender_name}`);
        console.log(`  Message: ${data.message}`);
        console.log(`  Post ID: ${data.postId || data.post_id || 'N/A'}`);
        console.log(`  Has Reply: ${data.reply ? '✅' : '❌'}`);
        console.log(`  Reply: ${data.reply ? data.reply.substring(0, 80) : 'No reply'}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
  
  process.exit(0);
})();
