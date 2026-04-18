/**
 * 🔍 Direct Facebook Comment Checker
 * Fetches comments directly from Facebook Graph API
 */
const axios = require('axios');
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const serviceAccount = JSON.parse(fs.readFileSync(path.join(__dirname, 'firebase-service-account.json'), 'utf8'));
if (!admin.apps.length) admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function checkFacebookComments() {
    console.log('\n🔍 ====== DIRECT FACEBOOK COMMENT CHECK ======\n');

    // Get brand data
    const brandDoc = await db.collection('brands').doc('Skinzy').get();
    const brand = brandDoc.data();
    const pageToken = brand.fbPageToken;
    const pageId = brand.facebookPageId;

    console.log('Page ID:', pageId);
    console.log('Page Name:', brand.name);
    console.log('');

    try {
        // Step 1: Get recent posts
        console.log('📌 Step 1: Fetching recent posts...');
        const postsResp = await axios.get(
            `https://graph.facebook.com/v21.0/${pageId}/posts`,
            {
                params: {
                    access_token: pageToken,
                    fields: 'id,message,created_time,permalink_url',
                    limit: 5
                }
            }
        );

        const posts = postsResp.data.data || [];
        console.log(`✅ Found ${posts.length} recent posts\n`);

        if (posts.length === 0) {
            console.log('❌ No posts found on this page!');
            console.log('You need to create a post first before commenting.');
            return;
        }

        // Step 2: Check comments on each post
        console.log('📌 Step 2: Checking comments on each post...\n');

        for (const post of posts) {
            console.log(`Post ID: ${post.id}`);
            console.log(`Message: ${post.message?.substring(0, 100) || 'No text'}`);
            console.log(`Created: ${new Date(post.created_time).toLocaleString('en-US', { timeZone: 'Asia/Dhaka' })}`);
            console.log(`URL: ${post.permalink_url}`);

            try {
                // Get comments for this post
                const commentsResp = await axios.get(
                    `https://graph.facebook.com/v21.0/${post.id}/comments`,
                    {
                        params: {
                            access_token: pageToken,
                            fields: 'id,from,message,created_time,like_count',
                            limit: 20,
                            order: 'reverse_chronological'
                        }
                    }
                );

                const comments = commentsResp.data.data || [];
                console.log(`Comments: ${comments.length}\n`);

                if (comments.length > 0) {
                    comments.forEach((comment, idx) => {
                        const time = new Date(comment.created_time).toLocaleString('en-US', {
                            timeZone: 'Asia/Dhaka',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        console.log(`  ${idx + 1}. [${time}] ${comment.from?.name || 'Unknown'}`);
                        console.log(`     Message: "${comment.message}"`);
                        console.log(`     ID: ${comment.id}`);
                        console.log(`     Likes: ${comment.like_count || 0}`);
                        
                        // Check if this comment was processed
                        const wasProcessed = comment.message.includes('price') || 
                                           comment.message.includes('dam') ||
                                           comment.message.includes('কত');
                        
                        if (wasProcessed) {
                            console.log(`     ⚠️  This should have triggered automation!`);
                        }
                        console.log('');
                    });
                } else {
                    console.log('  No comments on this post\n');
                }

            } catch (err) {
                console.log(`  ❌ Error fetching comments: ${err.message}\n`);
            }
        }

        // Step 3: Check if webhook is working
        console.log('\n📌 Step 3: Checking webhook status...');
        
        const webhookResp = await axios.get(
            `https://graph.facebook.com/v21.0/${pageId}/subscribed_apps`,
            {
                params: {
                    access_token: pageToken
                }
            }
        );

        const subs = webhookResp.data.data || [];
        if (subs.length > 0) {
            console.log('✅ Webhook is subscribed');
            const fields = subs[0]?.subscribed_fields || [];
            console.log('Fields:', fields.join(', '));
            
            if (!fields.includes('feed')) {
                console.log('\n❌ CRITICAL: "feed" field is NOT subscribed!');
                console.log('This is why comment webhooks are not working!');
                console.log('\nSolution: Re-subscribe to webhooks with "feed" field');
            }
        } else {
            console.log('❌ NO WEBHOOK SUBSCRIPTION!');
        }

    } catch (error) {
        console.log('❌ Error:', error.response?.data?.error?.message || error.message);
    }

    console.log('');
}

checkFacebookComments().catch(e => console.error(e.message));
