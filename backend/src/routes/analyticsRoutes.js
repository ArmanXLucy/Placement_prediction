const express = require('express');
const { requireAuth } = require('../middleware/auth');
const analytics = require('../controllers/analyticsController');

const router = express.Router();

router.get('/dashboard', requireAuth, analytics.dashboard);

module.exports = router;
