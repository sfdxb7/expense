const express = require('express');
const { body } = require('express-validator');
const { register, login, getProfile } = require('../controllers/authController');
const auth = require('../middleware/auth');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

// Strong password validation
const passwordValidation = body('password')
  .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  .matches(/[a-z]/).withMessage('Password must contain at least one lowercase letter')
  .matches(/[A-Z]/).withMessage('Password must contain at least one uppercase letter')
  .matches(/[0-9]/).withMessage('Password must contain at least one number')
  .matches(/[!@#$%^&*]/).withMessage('Password must contain at least one special character (!@#$%^&*)');

// Public registration disabled - use Prisma Studio or manual user creation script
// router.post('/register', authLimiter, [
//   body('username').trim().isLength({ min: 3 }).withMessage('Username must be at least 3 characters'),
//   body('email').isEmail().withMessage('Invalid email'),
//   passwordValidation
// ], register);

router.post('/login', authLimiter, [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').notEmpty().withMessage('Password is required')
], login);

router.get('/profile', auth, getProfile);

module.exports = router;
