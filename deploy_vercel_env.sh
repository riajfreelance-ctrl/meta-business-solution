#!/bin/bash
echo "Removing old variables..."
npx vercel env rm PAGE_ACCESS_TOKEN production -y || true
npx vercel env rm APP_SECRET production -y || true
npx vercel env rm VERIFY_TOKEN production -y || true
npx vercel env rm FIREBASE_SERVICE_ACCOUNT production -y || true

echo "Adding PAGE_ACCESS_TOKEN..."
echo "EAAYJGWNDBl0BRNxUnRcUTOiBlKIZCQwfc2NlLTM5YGertCon38r0KKgdQdzIiQq8pkE93Eosjk3uZCqu8mZBZAB4BFVcfSvghJg8e7QODnM54ZBcwpHCzCkjB00Jv8rlAj9F5We5M4gMvO1hpilmHXzRYHf01DFe3L7X4OBOgLtaG58VvYE6ZAZBgZApZBTkwl30lpFZA8tQXQNeRqFXuSvisvJOBMQgZDZD" | npx vercel env add PAGE_ACCESS_TOKEN production

echo "Adding GEMINI_API_KEY..."
npx vercel env rm GEMINI_API_KEY production -y || true
echo "AIzaSyDTiRSR9RgR0DdaMb9BL20rLavJKmM4XM0" | npx vercel env add GEMINI_API_KEY production

echo "Adding APP_SECRET..."
echo "66fec7b2824085e29e47d504f5699f68" | npx vercel env add APP_SECRET production

echo "Adding VERIFY_TOKEN..."
echo "myapp4204" | npx vercel env add VERIFY_TOKEN production

echo "Adding FIREBASE_SERVICE_ACCOUNT securely..."
npx vercel env add FIREBASE_SERVICE_ACCOUNT production < server/firebase-service-account.json

echo "Deploying to production to apply changes..."
npx vercel --prod --yes
