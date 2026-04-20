/**
 * Debug script to check Comment Data Center entries and brand matching
 */

const { db } = require('./services/firestoreService');

async function debugDataCenter() {
  try {
    console.log('🔍 Debugging Comment Data Center...\n');

    // Check all brands
    const brandsSnap = await db.collection('brands').get();
    console.log('📋 Available Brands:');
    brandsSnap.docs.forEach(d => {
      const data = d.data();
      console.log(`  - ID: "${d.id}" | Name: ${data.name} | Owner: ${data.ownerEmail}`);
    });

    console.log('\n');

    // Check all comment_data_center entries
    const dataSnap = await db.collection('comment_data_center').get();
    console.log(`📊 Comment Data Center Entries (${dataSnap.size} total):`);
    
    dataSnap.docs.forEach(d => {
      const data = d.data();
      console.log(`\n  Entry ID: ${d.id}`);
      console.log(`  BrandId: "${data.brandId}"`);
      console.log(`  PostId: ${data.postId || 'Global'}`);
      console.log(`  IsActive: ${data.isActive}`);
      console.log(`  Questions: ${data.questions?.length || 0}`);
      console.log(`  Total Replies: ${data.questions?.reduce((sum, q) => sum + q.replies.length, 0) || 0}`);
    });

    console.log('\n');

    // Check for potential mismatches
    const dataEntries = dataSnap.docs.map(d => d.data());
    const brandIds = new Set(brandsSnap.docs.map(d => d.id));
    const dataBrandIds = new Set(dataEntries.map(d => d.brandId));

    console.log('🔎 Brand ID Matching:');
    dataBrandIds.forEach(brandId => {
      if (brandIds.has(brandId)) {
        console.log(`  ✅ "${brandId}" - Valid brand exists`);
      } else {
        console.log(`  ❌ "${brandId}" - NO MATCHING BRAND!`);
      }
    });

    console.log('\n✅ Debug complete!');
    console.log('\n💡 If you see ❌ above, the brandId in comment_data_center doesn\'t match any brand.');
    console.log('   You need to update the seed script with the correct brandId.\n');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDataCenter();
