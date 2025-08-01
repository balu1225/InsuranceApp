

const express = require('express');
const router = express.Router();
const ichraClassController = require('../controllers/ichraClassController');

router.post('/', ichraClassController.createClass);
router.get('/:groupId', ichraClassController.getClassesByGroup);
router.delete('/:classId', ichraClassController.deleteClass);

module.exports = router;