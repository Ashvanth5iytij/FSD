const express = require('express');
const router = express.Router();
const controller = require('../controllers/orderController');

router.get('/', controller.getOrders);
router.get('/stats/top-order', controller.getHighestOrder);
router.get('/stats/top-customer', controller.getMostActiveCustomer);

module.exports = router;
