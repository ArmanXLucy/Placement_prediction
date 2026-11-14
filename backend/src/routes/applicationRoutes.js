const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const application = require('../controllers/applicationController');

const router = express.Router();

router.use(requireAuth);

router.get('/', application.list);
router.post('/', application.create);
router.patch('/:id/status', requireRole('admin'), application.updateStatus);
router.delete('/:id', application.withdraw);

module.exports = router;
