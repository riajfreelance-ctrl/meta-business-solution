const { execSync } = require('child_process');
const fs = require('fs');

function updateEnv(key, value) {
  console.log(`Updating ${key}...`);
  try { execSync(`npx vercel env rm ${key} production -y`, { stdio: 'ignore' }); } catch (e) {}
  execSync(`npx vercel env add ${key} production`, { input: value, stdio: 'ignore' });
}

console.log('Synchronizing Vercel Output variables...');
updateEnv('FACEBOOK_PAGE_ID', '963307416870090');
updateEnv('PAGE_ACCESS_TOKEN', 'EAAYJGWNDBl0BRPFm6xDP4XgQxMpatYWiUAtH32XhECzQjUYAKeoS4GbmtuEmCne4FjNu1BJ92JE1HImFTSz6saGBErgymH3qoGxfT57RZAbYXpX7uck3LvLtK8iSYDOtsxGOdAARtRQyU8IukkNKGWvwgzIFk6D3gTEuhFGGzZBqtyZAjaoV5ZAtwSTaRneZB43vkZBZArje1qeAEtKZBwLvSL9PtgZDZD');
updateEnv('APP_SECRET', '66fec7b2824085e29e47d504f5699f68');
updateEnv('VERIFY_TOKEN', 'myapp4204');

const fbJson = fs.readFileSync('./server/firebase-service-account.json', 'utf8');
updateEnv('FIREBASE_SERVICE_ACCOUNT', fbJson);
updateEnv('GOOGLE_APPLICATION_CREDENTIALS_JSON', fbJson);

console.log('Deploying to Vercel to apply new environment variables...');
execSync('npx vercel --prod --yes --token $VERCEL_TOKEN --scope $VERCEL_ORG_ID', { stdio: 'inherit' }); // Using local auth since we're in terminal
