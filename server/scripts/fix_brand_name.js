const admin = require('firebase-admin');
const { db } = require('./services/firestoreService');

async function fixBrand(brandId, newName) {
  try {
    const docRef = db.collection('brands').doc(brandId);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      console.log(`Brand with ID ${brandId} not found.`);
      return;
    }

    const greeting = `${newName}-তে আপনাকে স্বাগতম! আমি তায়েবা হোসেন বলছি। আজ আপনাকে কীভাবে সাহায্য করতে পারি? ✨`;
    const persona = `I am Tayeba Hossain, a friendly and professional customer service representative for ${newName}. I provide a personal human touch and speak only in Bangla.`;

    await docRef.update({
      name: newName,
      blueprint: {
        greeting: greeting,
        persona: persona
      }
    });

    console.log(`✅ Fixed! Brand ID ${brandId} is now named ${newName} and blueprint updated.`);
  } catch (e) {
    console.error(`❌ Error updating brand: ${e.message}`);
  }
  process.exit(0);
}

// Set this to whichever brand you want to fix
// For now, setting to Azlaan and newName to "Anzaar" or "Azlaan"
// The user says "anzaar dekhacche" so maybe they want it to be that.
// But Azlaan sounds the same in some ways.
const targetName = "Anzaar";
fixBrand('Azlaan', targetName);
