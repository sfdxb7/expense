const express = require('express');
const { getReport, getYearlyReport } = require('../controllers/reportController');
const auth = require('../middleware/auth');

const router = express.Router();

router.use(auth);

router.get('/property/:propertyId', getReport);
router.get('/property/:propertyId/year/:year', getYearlyReport);

module.exports = router;
