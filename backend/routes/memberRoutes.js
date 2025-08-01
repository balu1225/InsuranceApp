const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');


router.post('/:groupId/members', memberController.createMembers);

router.get('/:groupId/members', memberController.getMembers);

router.put('/:groupId/members', memberController.replaceMembers);

router.delete('/:groupId/members', memberController.deleteMembers);

module.exports = router;