const express = require('express');
const router = express.Router();

const {
  createGroup,
  getAllGroups,
  deleteGroup,
  refreshGroup
} = require('../controllers/groupController');

// POST /api/groups → create new group
router.post('/', createGroup);

// GET /api/groups → get all groups from MongoDB
router.get('/', getAllGroups);

// DELETE /api/groups/:id → delete group by Mongo _id
router.delete('/:id', deleteGroup);

// PUT /api/groups/:id/refresh → update group by refetching from Ideon
router.put('/:id/refresh', refreshGroup);

module.exports = router;