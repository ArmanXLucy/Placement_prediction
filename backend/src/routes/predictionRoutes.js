const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const prediction = require('../controllers/predictionController');

const router = express.Router();

router.use(requireAuth);

router.post('/me', prediction.predictMine);
router.get('/me', prediction.mine);
router.get('/student/:studentId', requireRole('admin'), prediction.forStudent);

module.exports = router;
