const sharp = require('sharp');
const { serverLog } = require('../utils/logger');

/**
 * Generate perceptual hash (pHash) from an image URL.
 * Uses sharp for Node.js compatibility. Returns hex string.
 */
async function generatePHash(imageUrl) {
    try {
        // Download image
        const axios = require('axios');
        const response = await axios.get(imageUrl, {
            responseType: 'arraybuffer',
            timeout: 10000
        });
        
        // Resize to 32x32 and convert to grayscale
        const { data, info } = await sharp(response.data)
            .resize(32, 32)
            .grayscale()
            .raw()
            .toBuffer({ resolveWithObject: true });
        
        // Calculate average pixel value
        let sum = 0;
        for (let i = 0; i < data.length; i++) {
            sum += data[i];
        }
        const avg = sum / data.length;
        
        // Generate hash based on whether pixel is above/below average
        let hash = '';
        for (let i = 0; i < data.length; i += 4) {
            hash += data[i] > avg ? '1' : '0';
        }
        
        // Convert binary hash to hex (16 chars)
        let hexHash = '';
        for (let i = 0; i < hash.length; i += 4) {
            const chunk = hash.substr(i, 4);
            hexHash += parseInt(chunk, 2).toString(16);
        }
        
        return hexHash.substr(0, 16);
    } catch (err) {
        serverLog(`[pHash Error]: ${err.message} for URL: ${imageUrl}`);
        return null;
    }
}

/**
 * Compare two hex hashes and calculate the Hamming Distance.
 * Lower distance = more similar. Typically < 5 or 10 means same image/screenshot.
 */
function getHammingDistance(hash1, hash2) {
    if (!hash1 || !hash2 || hash1.length !== hash2.length) return 999;
    let distance = 0;
    for (let i = 0; i < hash1.length; i++) {
        const hex1 = parseInt(hash1[i], 16).toString(2).padStart(4, '0');
        const hex2 = parseInt(hash2[i], 16).toString(2).padStart(4, '0');
        for (let j = 0; j < 4; j++) {
            if (hex1[j] !== hex2[j]) distance++;
        }
    }
    return distance;
}

module.exports = {
    generatePHash,
    getHammingDistance
};
