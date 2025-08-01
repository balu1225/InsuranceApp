const express = require('express');
const router = express.Router();
const comparisonController = require('../controllers/comparisonController');

router.get('/:groupId', comparisonController.generateComparison);

module.exports = router;