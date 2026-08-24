const express = require('express');
const router = express.Router();
const controller = require('../controllers/paymentController');

router.post('/', controller.processPayment);
router.get('/accounts', controller.getAccounts);

module.exports = router;
