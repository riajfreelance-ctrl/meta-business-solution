// API endpoint to seed Data Center rules
const express = require('express');
const router = express.Router();
const { db, serverTimestamp } = require('../services/firestoreService');

// POST /api/seed-data-center - Add Data Center rules for Skinzy
router.post('/seed-data-center', async (req, res) => {
  try {
    const { brandId, postId } = req.body;
    
    if (!brandId) {
      return res.status(400).json({ error: 'brandId required' });
    }

    // Create global template with common keywords
    const globalTemplate = {
      brandId: brandId,
      postId: null, // Global - applies to all posts
      isGlobal: true,
      isActive: true,
      title: 'Skinzy Auto-Reply Template',
      questions: [
        {
          keywords: ['price', 'দাম', 'rate', 'cost', 'price ki', 'dam koto', 'dam?', 'price?', 'koto', 'কত'],
          replies: [
            {
              public: "আপনাকে ধন্যবাদ! 😊 আমাদের প্রোডাক্টের দাম সম্পর্কে বিস্তারিত জানতে inbox এ message করুন অথবা 'order' লিখুন!",
              private: "Customer interested in price. Follow up with pricing details."
            },
            {
              public: "ধন্যবাদ! 🙏 Price জানতে চাওয়ার জন্য। সঠিক তথ্যের জন্য আমাদের inbox এ যোগাযোগ করুন!",
              private: "Price inquiry detected. Send catalog via DM."
            },
            {
              public: "ভালো প্রশ্ন! 💯 আমাদের best price offer পেতে inbox করুন। Limited time discount চলছে! 🎉",
              private: "Price inquiry. Mention current discount offer."
            },
            {
              public: "ধন্যবাদ আমাদের আগ্রহ দেখানোর জন্য! ❤️ Price details inbox এ পাঠানো হলো। Check করুন!",
              private: "Send price list via Messenger."
            },
            {
              public: "Great question! ✨ আমাদের competitive pricing আছে। Details জানতে inbox করুন!",
              private: "Price inquiry. Highlight competitive pricing."
            }
          ]
        },
        {
          keywords: ['order', 'অর্ডার', 'buy', 'কিনতে চাই', 'নিতে চাই', 'order korbo', 'oder', 'কিনব'],
          replies: [
            {
              public: "অসাধারণ! 🎉 অর্ডার করতে হলে আমাদের inbox এ আপনার নাম, ঠিকানা এবং ফোন নম্বর পাঠান।",
              private: "Customer wants to order. Collect shipping details."
            },
            {
              public: "ধন্যবাদ! 📦 Order confirmation এর জন্য inbox এ details পাঠান। আমরা尽快 deliver করবো!",
              private: "Order request. Send order form."
            },
            {
              public: "হ্যাঁ, অবশ্যই! ✅ Order করতে inbox করুন। Cash on Delivery available! 💰",
              private: "Order inquiry. Confirm COD availability."
            },
            {
              public: "Great! 🛍️ Order প্রসেস করতে আমাদের inbox এ message দিন। Fast delivery guaranteed!",
              private: "Process order immediately."
            },
            {
              public: "অর্ডার করার জন্য ধন্যবাদ! 🎊 Inbox এ আপনার details পাঠান, আমরা confirm করবো!",
              private: "Collect customer info for order."
            }
          ]
        },
        {
          keywords: ['delivery', 'ডেলিভারি', 'কতদিন', 'কত দিন', 'কখন পাব', 'delivery charge', 'shipping'],
          replies: [
            {
              public: "আমরা সারা বাংলাদেশে delivery করি! 🚚 ঢাকায় ১-২ দিন, ঢাকার বাইরে ২-৩ দিন। Delivery charge: ঢাকায় ৬০ টাকা, বাইরে ১২০ টাকা।",
              private: "Delivery info: Dhaka 1-2 days (60 BDT), Outside 2-3 days (120 BDT)"
            },
            {
              public: "ডেলিভারি সম্পর্কে: 📦 ঢাকায় ২৪-৪৮ ঘন্টা, বাইরে ২-৩ দিন। Cash on Delivery available! ✅",
              private: "Explain delivery timeline and charges."
            },
            {
              public: "Fast delivery! ⚡ Order confirm হওয়ার পর ১-৩ কর্মদিবসের মধ্যে পাবেন। Tracking number দেওয়া হবে!",
              private: "Provide delivery timeline."
            },
            {
              public: "হ্যাঁ, delivery হয়! 🎯 সারা বাংলাদেশে। Details জানতে inbox করুন!",
              private: "Confirm delivery availability."
            },
            {
              public: "Delivery charge এবং time জানতে inbox করুন। আমরা সব জায়গায় deliver করি! 🌟",
              private: "Send delivery details via DM."
            }
          ]
        }
      ],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    // Add to Firestore
    const docRef = await db.collection('comment_data_center').add(globalTemplate);

    res.json({
      success: true,
      message: 'Data Center rules created successfully',
      docId: docRef.id,
      rules: {
        global: true,
        questionSets: globalTemplate.questions.length,
        keywords: globalTemplate.questions.map(q => q.keywords)
      }
    });

  } catch (error) {
    console.error('Seed Data Center Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
