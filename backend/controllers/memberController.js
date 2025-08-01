const Member = require('../models/Member');
const Group = require('../models/Group');
const IdeonService = require('../services/ideonService');

// ✅ Create and sync members to Ideon + save locally
exports.createMembers = async (req, res) => {
  const { groupId } = req.params;
  const { ichraClassId, members } = req.body;

  try {
    const group = await Group.findById(groupId);
    if (!group?.ideon_group_id) {
      return res.status(404).json({ message: 'Group or Ideon group ID not found' });
    }

    const response = await IdeonService.createMembers(group.ideon_group_id, members);

    const saved = await Promise.all(
      response.members.map((member, index) => {
        const original = members[index];
        return new Member({
          ...member,
          group_id: groupId,
          ichra_class_id: ichraClassId,
          old_employer_contribution: original.old_employer_contribution || 0,
          old_employee_contribution: original.old_employee_contribution || 0
        }).save();
      })
    );

    res.status(201).json(saved);
  } catch (error) {
    console.error('❌ Error creating members:', error.message);
    if (error.response?.data) {
      console.error('❌ Ideon Error Response:', JSON.stringify(error.response.data, null, 2));
    }
    res.status(500).json({ message: 'Failed to create members', error: error.message });
  }
};

// ✅ Get members from local MongoDB only
exports.getMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const members = await Member.find({ group_id: groupId });
    res.json(members);
  } catch (err) {
    console.error('❌ Error fetching members:', err);
    res.status(500).json({ message: 'Failed to fetch members' });
  }
};

// ✅ Replace all members via Ideon and Mongo
exports.replaceMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { ichraClassId, members } = req.body;

    const group = await Group.findById(groupId);
    if (!group?.ideon_group_id) {
      return res.status(404).json({ message: 'Group or Ideon group ID not found' });
    }

    const response = await IdeonService.replaceMembersInGroup(group.ideon_group_id, members);
    await Member.deleteMany({ group_id: groupId });

    const saved = await Promise.all(
      response.members.map((member, index) => {
        const original = members[index];
        return new Member({
          ...member,
          group_id: groupId,
          ichra_class_id: ichraClassId,
          old_employer_contribution: original.old_employer_contribution || 0,
          old_employee_contribution: original.old_employee_contribution || 0
        }).save();
      })
    );

    res.json(saved);
  } catch (err) {
    console.error('❌ Error replacing members:', err);
    res.status(500).json({ message: 'Failed to replace members' });
  }
};

// ✅ Delete all members from Ideon + Mongo
exports.deleteMembers = async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group?.ideon_group_id) {
      return res.status(404).json({ message: 'Group or Ideon group ID not found' });
    }

    await IdeonService.deleteMembersFromGroup(group.ideon_group_id);
    await Member.deleteMany({ group_id: groupId });

    res.status(204).send(); // No content, success
  } catch (err) {
    console.error('❌ Error deleting members:', err);
    res.status(500).json({ message: 'Failed to delete members' });
  }
};