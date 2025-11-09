const express = require('express');
const { body } = require('express-validator');
const {
  getProperties,
  getProperty,
  createProperty,
  updateProperty,
  deleteProperty
} = require('../controllers/propertyController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/', getProperties);
router.get('/:id', getProperty);

router.post('/', [
  body('name').trim().notEmpty().withMessage('Name is required')
], createProperty);

router.put('/:id', [
  body('name').trim().notEmpty().withMessage('Name is required')
], updateProperty);

router.delete('/:id', deleteProperty);

module.exports = router;
