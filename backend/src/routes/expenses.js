const express = require('express');
const { body } = require('express-validator');
const {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense
} = require('../controllers/expenseController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

router.use(auth);

router.get('/property/:propertyId', getExpenses);

router.post('/property/:propertyId', upload.single('receipt'), [
  body('date').isISO8601().withMessage('Invalid date'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('categoryId').isInt().withMessage('Category ID is required')
], createExpense);

router.put('/property/:propertyId/:id', upload.single('receipt'), [
  body('date').isISO8601().withMessage('Invalid date'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('categoryId').isInt().withMessage('Category ID is required')
], updateExpense);

router.delete('/property/:propertyId/:id', deleteExpense);

module.exports = router;
