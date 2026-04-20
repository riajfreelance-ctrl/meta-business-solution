#!/usr/bin/env node
/**
 * Quick Vercel Environment Update Script
 * Updates FACEBOOK_PAGE_ID in Vercel and triggers redeploy
 */

const axios = require('axios');

// Vercel project details
const VERCEL_PROJECT_ID = 'prj_v6TboQshBol7n1ZPx0q1VZT3TMsL';
const VERCEL_ORG_ID = 'team_vcHuT77EfsGhhDxAmJ9eJozr';

// The token you provided won't work for Vercel API - we need a Vercel token
// But let me show you what needs to be done

console.log('\n🔧 VERCEL ENVIRONMENT UPDATE NEEDED\n');
console.log('========================================');
console.log('⚠️  IMPORTANT: Code deployed, but ENV needs update!');
console.log('========================================\n');

console.log('The GitHub push will trigger a Vercel deployment,');
console.log('but the environment variable still needs to be updated.\n');

console.log('📋 YOU NEED TO DO THIS MANUALLY (takes 30 seconds):\n');

console.log('1. Go to: https://vercel.com/riajfreelance-ctrls-projects/metasolution/settings/environment-variables\n');

console.log('2. Find FACEBOOK_PAGE_ID and change it to:');
console.log('   ✅ 963307416870090\n');

console.log('3. Click "Save"\n');

console.log('4. Go to Deployments tab and click "Redeploy" on the latest deployment\n');

console.log('========================================');
console.log('📊 Current Status:');
console.log('========================================');
console.log('✅ Code pushed to GitHub');
console.log('⏳ Vercel deployment in progress (check in 1-2 min)');
console.log('⚠️  FACEBOOK_PAGE_ID needs manual update in Vercel dashboard');
console.log('');

console.log('💡 After updating the env variable and redeploying:');
console.log('   - Test by commenting "price koto?" on Facebook');
console.log('   - Check logs at: https://vercel.com/riajfreelance-ctrls-projects/metasolution/logs');
console.log('');
