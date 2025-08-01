const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');

router.post('/:groupId/offmarket', quoteController.generateOffMarketQuotes);
router.post('/:groupId/onmarket', quoteController.generateOnMarketQuotes);
router.post('/:groupId/all', quoteController.generateAllQuotes);

module.exports = router;