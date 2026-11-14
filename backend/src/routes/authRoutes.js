const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const { requireAuth } = require('../middleware/auth');
const auth = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('first_name').trim().notEmpty().withMessage('First name is required'),
    body('last_name').trim().notEmpty().withMessage('Last name is required'),
    body('cgpa').optional({ values: 'null' }).isFloat({ min: 0, max: 10 }),
    body('backlogs').optional({ values: 'null' }).isInt({ min: 0 }),
    body('graduation_year')
      .optional({ values: 'null' })
      .isInt({ min: 2000, max: 2100 })
  ],
  validate,
  auth.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('A valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required')
  ],
  validate,
  auth.login
);

router.get('/me', requireAuth, auth.me);

module.exports = router;
