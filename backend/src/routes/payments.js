const express = require('express');
const { body } = require('express-validator');
const {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment
} = require('../controllers/paymentController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/debtor/:debtorId', getPayments);

router.post('/debtor/:debtorId', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date').isISO8601().withMessage('Invalid date')
], createPayment);

router.put('/debtor/:debtorId/:id', [
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('date').isISO8601().withMessage('Invalid date')
], updatePayment);

router.delete('/debtor/:debtorId/:id', deletePayment);

module.exports = router;
