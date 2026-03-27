const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

const serviceAccountPath = path.join(__dirname, 'firebase-service-account.json');

const config = {
  projectId: "advance-automation-8029e"
};

if (fs.existsSync(serviceAccountPath)) {
  config.credential = admin.credential.cert(serviceAccountPath);
}

admin.initializeApp(config);

async function setCors() {
  // Try to find the bucket
  const [buckets] = await admin.storage().getBuckets();
  if (buckets.length === 0) {
    console.error("No buckets found in this project!");
    process.exit(1);
  }

  for (const bucket of buckets) {
    console.log(`Setting CORS for bucket: ${bucket.name}...`);
    await bucket.setCorsConfiguration([
      {
        maxAgeSeconds: 3600,
        method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        origin: ['*'],
        responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
      },
    ]);
  }
  
  console.log('CORS Configuration Applied to all buckets!');
  process.exit(0);
}

setCors().catch(err => {
  console.error('Failed to set CORS:', err);
  process.exit(1);
});
