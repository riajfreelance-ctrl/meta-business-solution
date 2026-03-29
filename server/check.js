const { db } = require('./services/firestoreService');
db.collection('brands').get().then(snap => {
  snap.forEach(doc => {
    const d = doc.data();
    console.log('Brand:', d.name);
    console.log('  autoReply:', d.autoReply);
    console.log('  facebookPageId:', d.facebookPageId);
    console.log('  hasToken:', !!(d.facebookPageAccessToken || d.fbPageToken));
    console.log('---');
  });
  process.exit();
}).catch(e => { console.error(e.message); process.exit(1); });
