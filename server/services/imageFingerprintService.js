const { imageHash } = require('image-hash');
const { serverLog } = require('../utils/logger');

/**
 * Generate perceptual hash (pHash) from an image URL.
 * Uses 16-bit precision. Returns hex string.
 */
function generatePHash(imageUrl) {
    return new Promise((resolve) => {
        try {
            imageHash(imageUrl, 16, true, (error, data) => {
                if (error) {
                    serverLog(`[pHash Error]: ${error.message} for URL: ${imageUrl}`);
                    return resolve(null);
                }
                resolve(data);
            });
        } catch (err) {
            serverLog(`[pHash Crash]: ${err.message}`);
            resolve(null);
        }
    });
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
