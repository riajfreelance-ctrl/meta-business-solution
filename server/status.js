module.exports = (req, res) => {
  res.json({ status: 'API is working via /api/status.js', time: new Date().toISOString() });
};
