const admin = require('firebase-admin');
const path = require('path');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');
const bucketName = 'advance-automation-8029e.firebasestorage.app';

if (require('fs').existsSync(serviceAccountPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    storageBucket: bucketName
  });
} else {
  admin.initializeApp({
    projectId: "advance-automation-8029e",
    storageBucket: bucketName
  });
}

async function setCors() {
  console.log(`Setting CORS for bucket: ${bucketName}...`);
  const bucket = admin.storage().bucket();
  
  await bucket.setCorsConfiguration([
    {
      maxAgeSeconds: 3600,
      method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      origin: ['*'], // In production, replace with your domain
      responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
    },
  ]);
  
  console.log('CORS Configuration Applied Successfully!');
  process.exit(0);
}

setCors().catch(err => {
  console.error('Failed to set CORS:', err);
  process.exit(1);
});
