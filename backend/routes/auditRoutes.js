const express = require('express');
const router = express.Router();
const controller = require('../controllers/auditController');

router.get('/daily', controller.getDailyActivity);

module.exports = router;
