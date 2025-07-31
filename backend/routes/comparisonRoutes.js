const express = require('express');
const router = express.Router();
const { generateGroupComparison } = require('../controllers/comparisonController');

router.get('/:groupId/comparison', generateGroupComparison);

module.exports = router;