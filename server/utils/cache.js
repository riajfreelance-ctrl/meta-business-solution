const cache = new Map();
const DEFAULT_TTL = 300000; // 5 minutes

/**
 * Store a value in the cache with an optional TTL.
 * @param {string} key 
 * @param {any} value 
 * @param {number} ttl - Time to live in milliseconds
 */
function set(key, value, ttl = DEFAULT_TTL) {
    const expiry = Date.now() + ttl;
    cache.set(key, { value, expiry });
}

/**
 * Retrieve a value from the cache. Returns null if expired or missing.
 * @param {string} key 
 * @returns {any|null}
 */
function get(key) {
    const data = cache.get(key);
    if (!data) return null;
    
    if (Date.now() > data.expiry) {
        cache.delete(key);
        return null;
    }
    
    return data.value;
}

/**
 * Clear a specific key or the entire cache.
 * @param {string} [key] 
 */
function clear(key) {
    if (key) {
        cache.delete(key);
    } else {
        cache.clear();
    }
}

module.exports = { set, get, clear };
