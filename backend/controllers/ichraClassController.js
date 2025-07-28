 // backend/controllers/ichraClassController.js

const IchraClass = require('../models/IchraClass');

// ✅ Create a new ICHRA class
exports.createClass = async (req, res) => {
  try {
    const { group_id, class_name, subclass_name, contribution } = req.body;

    const newClass = new IchraClass({
      group_id,
      class_name,
      subclass_name,
      contribution
    });

    await newClass.save();
    res.status(201).json({ message: 'ICHRA class created', data: newClass });
  } catch (err) {
    console.error('Error creating ICHRA class:', err);
    res.status(500).json({ error: 'Failed to create ICHRA class' });
  }
};

// ✅ Get all classes for a specific group
exports.getClassesByGroup = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const classes = await IchraClass.find({ group_id: groupId });
    res.status(200).json(classes);
  } catch (err) {
    console.error('Error fetching classes:', err);
    res.status(500).json({ error: 'Failed to fetch ICHRA classes' });
  }
};

// ✅ Delete a specific ICHRA class
exports.deleteClass = async (req, res) => {
  try {
    const classId = req.params.classId;
    await IchraClass.findByIdAndDelete(classId);
    res.status(200).json({ message: 'ICHRA class deleted' });
  } catch (err) {
    console.error('Error deleting class:', err);
    res.status(500).json({ error: 'Failed to delete class' });
  }
};