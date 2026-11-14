const express = require('express');
const { requireAuth, requireRole, optionalAuth } = require('../middleware/auth');
const job = require('../controllers/jobController');

const router = express.Router();

router.get('/', optionalAuth, job.list);
router.get('/companies', optionalAuth, job.companies);
router.get('/:id', optionalAuth, job.detail);

router.post('/', requireAuth, requireRole('admin'), job.create);
router.put('/:id', requireAuth, requireRole('admin'), job.update);
router.delete('/:id', requireAuth, requireRole('admin'), job.remove);

module.exports = router;
