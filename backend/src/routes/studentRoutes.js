const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');
const student = require('../controllers/studentController');

const router = express.Router();

router.use(requireAuth);

router.get('/me', student.getMe);
router.put('/me', student.updateMe);
router.put('/me/skills', student.setSkills);

router.get('/', requireRole('admin'), student.list);
router.get('/:id', requireRole('admin'), student.getById);

module.exports = router;
