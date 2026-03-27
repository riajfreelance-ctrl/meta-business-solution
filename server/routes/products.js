const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

router.post('/products/bulk-update', productController.bulkUpdateProducts);

module.exports = router;
