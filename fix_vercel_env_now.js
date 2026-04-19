/**
 * 🔧 VERCEL ENV FIX SCRIPT
 * Fixes incorrect env vars on Vercel that are causing 500 errors
 * Problems Found:
 *   1. FACEBOOK_PAGE_ID = wrong value (61587065925121 instead of 963307416870090)
 *   2. VERIFY_TOKEN has \n at end (causes webhook verification failure)
 *   3. FIREBASE_SERVICE_ACCOUNT missing (causes server crash = 500 error)
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'server/.env') });

// Read Vercel token from .vercel directory or ask user
const vercelProjectId = 'prj_v6TboQshBol7n1ZPx0q1VZT3TMsL';
const vercelOrgId = 'team_vcHuT77EfsGhhDxAmJ9eJozr';

// ─── READ FIREBASE SERVICE ACCOUNT ───
const saPath = path.join(__dirname, 'server/firebase-service-account.json');
let firebaseSA = '';
try {
    const saContent = fs.readFileSync(saPath, 'utf8');
    // Minify JSON for env var
    firebaseSA = JSON.stringify(JSON.parse(saContent));
    console.log('✅ Firebase Service Account loaded');
} catch(e) {
    console.log('❌ Cannot load Firebase Service Account:', e.message);
    process.exit(1);
}

// ─── ENV VARS TO SET ───
const envVarsToFix = [
    {
        key: 'FACEBOOK_PAGE_ID',
        value: '963307416870090',  // Skinzy correct page ID
        target: ['production', 'preview', 'development'],
        type: 'plain'
    },
    {
        key: 'VERIFY_TOKEN',
        value: 'myapp4204',  // remove \n
        target: ['production', 'preview', 'development'],
        type: 'plain'
    },
    {
        key: 'PAGE_ACCESS_TOKEN',
        value: process.env.PAGE_ACCESS_TOKEN,
        target: ['production', 'preview', 'development'],
        type: 'encrypted'
    },
    {
        key: 'APP_SECRET',
        value: process.env.APP_SECRET || '66fec7b2824085e29e47d504f5699f68',
        target: ['production', 'preview', 'development'],
        type: 'encrypted'
    },
    {
        key: 'GEMINI_API_KEY',
        value: process.env.GEMINI_API_KEY,
        target: ['production', 'preview', 'development'],
        type: 'encrypted'
    },
    {
        key: 'FIREBASE_SERVICE_ACCOUNT',
        value: firebaseSA,
        target: ['production', 'preview', 'development'],
        type: 'encrypted'
    }
];

// Get Vercel token from environment
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
if (!VERCEL_TOKEN) {
    console.log('\n❌ VERCEL_TOKEN not set!');
    console.log('Set it: export VERCEL_TOKEN=your_token_here');
    console.log('\n📝 Manual Fix Instructions:');
    console.log('Go to: https://vercel.com/riajfreelance-ctrls-projects/metasolution/settings/environment-variables');
    console.log('\nAdd/Update these variables:');
    envVarsToFix.forEach(v => {
        if (v.key !== 'FIREBASE_SERVICE_ACCOUNT') {
            console.log(`  ${v.key} = ${v.value}`);
        } else {
            console.log(`  FIREBASE_SERVICE_ACCOUNT = [Firebase Service Account JSON - minified]`);
        }
    });
    console.log('\n⚡ After updating, click "Redeploy" in Vercel dashboard');
    process.exit(0);
}

async function updateVercelEnv() {
    const headers = {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
    };

    console.log('\n🔧 Updating Vercel environment variables...\n');

    for (const envVar of envVarsToFix) {
        if (!envVar.value) {
            console.log(`⚠️  SKIP ${envVar.key} - value is empty`);
            continue;
        }
        try {
            // First try to delete existing
            try {
                const listResp = await axios.get(
                    `https://api.vercel.com/v9/projects/${vercelProjectId}/env?teamId=${vercelOrgId}`,
                    { headers }
                );
                const existing = listResp.data.envs?.find(e => e.key === envVar.key);
                if (existing) {
                    await axios.delete(
                        `https://api.vercel.com/v9/projects/${vercelProjectId}/env/${existing.id}?teamId=${vercelOrgId}`,
                        { headers }
                    );
                }
            } catch(e) {}

            // Create new
            await axios.post(
                `https://api.vercel.com/v10/projects/${vercelProjectId}/env?teamId=${vercelOrgId}`,
                {
                    key: envVar.key,
                    value: envVar.value,
                    target: envVar.target,
                    type: envVar.type
                },
                { headers }
            );
            console.log(`✅ ${envVar.key} - Updated`);
        } catch(e) {
            console.log(`❌ ${envVar.key} - Failed:`, e.response?.data?.error?.message || e.message);
        }
    }

    // Trigger redeploy
    console.log('\n🚀 Triggering redeploy...');
    try {
        const deployResp = await axios.post(
            `https://api.vercel.com/v13/deployments?teamId=${vercelOrgId}`,
            {
                name: 'metasolution',
                gitSource: null,
                target: 'production',
                projectId: vercelProjectId
            },
            { headers }
        );
        console.log('✅ Redeploy triggered!', deployResp.data.url);
    } catch(e) {
        console.log('⚠️ Redeploy API failed (trigger manually from dashboard):', e.response?.data?.error?.message || e.message);
    }
}

updateVercelEnv();
