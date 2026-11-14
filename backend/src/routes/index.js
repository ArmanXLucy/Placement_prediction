const express = require('express');

const router = express.Router();

router.use('/auth', require('./authRoutes'));
router.use('/students', require('./studentRoutes'));
router.use('/jobs', require('./jobRoutes'));
router.use('/applications', require('./applicationRoutes'));
router.use('/recommendations', require('./recommendationRoutes'));
router.use('/predictions', require('./predictionRoutes'));
router.use('/analytics', require('./analyticsRoutes'));
router.use('/', require('./catalogRoutes'));

module.exports = router;
