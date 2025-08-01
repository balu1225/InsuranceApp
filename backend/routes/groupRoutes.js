const express = require('express');
const router = express.Router();

const {
  createGroup,
  getAllGroups,
  deleteGroup,
  refreshGroup
} = require('../controllers/groupController');


router.post('/', createGroup);

router.get('/', getAllGroups);

router.delete('/:id', deleteGroup);

router.put('/:id/refresh', refreshGroup);

module.exports = router;