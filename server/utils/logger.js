const fs = require('fs');
const path = require('path');

function serverLog(msg) {
    const logStr = `[${new Date().toISOString()}] ${msg}`;
    console.log(logStr);
}

module.exports = { serverLog };
