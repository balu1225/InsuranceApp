const express = require('express');
const router = express.Router();
const { calculateIchraAffordability } = require('../controllers/affordabilityController');

router.post('/:groupId/affordability', calculateIchraAffordability);

module.exports = router; 