const express = require('express');
const router = express.Router();
const memberController = require('../controllers/memberController');

// Create and sync members
router.post('/:groupId/members', memberController.createMembers);

// Get members from MongoDB
router.get('/:groupId/members', memberController.getMembers);

// Replace members in Ideon and local
router.put('/:groupId/members', memberController.replaceMembers);

// Delete all members
router.delete('/:groupId/members', memberController.deleteMembers);

module.exports = router;