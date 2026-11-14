const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const recommendation = require('../controllers/recommendationController');

const router = express.Router();

router.use(requireAuth);

router.get('/me', recommendation.mine);
router.get('/me/saved', recommendation.saved);
router.get('/student/:studentId', requireRole('admin'), recommendation.forStudent);

module.exports = router;
