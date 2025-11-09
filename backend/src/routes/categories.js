const express = require('express');
const { body } = require('express-validator');
const {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/property/:propertyId', getCategories);

router.post('/property/:propertyId', [
  body('name').trim().notEmpty().withMessage('Name is required')
], createCategory);

router.put('/property/:propertyId/:id', [
  body('name').trim().notEmpty().withMessage('Name is required')
], updateCategory);

router.delete('/property/:propertyId/:id', deleteCategory);

module.exports = router;
