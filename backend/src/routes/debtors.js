const express = require('express');
const { body } = require('express-validator');
const {
  getDebtors,
  createDebtor,
  updateDebtor,
  deleteDebtor
} = require('../controllers/debtorController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/property/:propertyId', getDebtors);

router.post('/property/:propertyId', [
  body('name').trim().notEmpty().withMessage('Name is required')
], createDebtor);

router.put('/property/:propertyId/:id', [
  body('name').trim().notEmpty().withMessage('Name is required')
], updateDebtor);

router.delete('/property/:propertyId/:id', deleteDebtor);

module.exports = router;
