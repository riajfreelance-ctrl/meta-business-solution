const fs = require('fs');
const path = require('path');

function serverLog(msg) {
    console.log(`[${new Date().toISOString()}] ${msg}`);
}

module.exports = { serverLog };
