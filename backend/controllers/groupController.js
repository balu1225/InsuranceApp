const Group = require('../models/Group');
const { createGroupOnIdeon, fetchGroupFromIdeon } = require('../services/ideonService');

// 1️⃣ Create Group
const createGroup = async (req, res) => {
  const groupData = req.body;

  try {
    const response = await createGroupOnIdeon(groupData);

    const saved = await Group.create({
      ...groupData.group,
      ideon_group_id: response.group.id,
      locations: response.locations.map((loc, i) => ({
        ...groupData.locations[i],
        ideon_location_id: loc.id
      }))
    });

    res.status(201).json(saved);
  } catch (error) {
    console.error("❌ Group creation failed:", {
      status: error.response?.status,
      data: error.response?.data
    });

    res.status(error.response?.status || 500).json({
      message: 'Error creating group',
      error: error.response?.data || error.message
    });
  }
};

// 2️⃣ Get All Groups
const getAllGroups = async (req, res) => {
  try {
    const groups = await Group.find();
    res.json(groups);
  } catch (err) {
    console.error('❌ Error fetching groups:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 3️⃣ Delete Group by ID
const deleteGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const deleted = await Group.findByIdAndDelete(id);
    if (!deleted) return res.status(404).json({ message: 'Group not found' });

    res.json({ message: '✅ Group deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting group:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// 4️⃣ Refresh Group from Ideon (update MongoDB with latest data)
const refreshGroup = async (req, res) => {
  const { id } = req.params;

  try {
    const group = await Group.findById(id);
    if (!group) return res.status(404).json({ message: 'Group not found' });

    const updatedData = await fetchGroupFromIdeon(group.ideon_group_id);

    group.set({
      ...updatedData.group,
      locations: updatedData.locations.map(loc => ({
        ...loc,
        ideon_location_id: loc.id
      }))
    });

    await group.save();
    res.json(group);
  } catch (err) {
    console.error('❌ Error refreshing group:', err);
    res.status(500).json({ message: 'Refresh failed', error: err.message });
  }
};

module.exports = {
  createGroup,
  getAllGroups,
  deleteGroup,
  refreshGroup
};