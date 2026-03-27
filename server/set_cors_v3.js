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

const bucketsToTry = [
  'advance-automation-8029e.firebasestorage.app',
  'advance-automation-8029e.appspot.com'
];

async function setCors() {
  for (const name of bucketsToTry) {
    try {
      console.log(`Setting CORS for bucket: ${name}...`);
      const bucket = admin.storage().bucket(name);
      
      await bucket.setCorsConfiguration([
        {
          maxAgeSeconds: 3600,
          method: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          origin: ['*'],
          responseHeader: ['Content-Type', 'Authorization', 'x-goog-resumable'],
        },
      ]);
      console.log(`Successfully set CORS for ${name}`);
    } catch (e) {
      console.log(`Failed for ${name}: ${e.message}`);
    }
  }
  process.exit(0);
}

setCors().catch(console.error);
