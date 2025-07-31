const Group = require('../models/Group');
const IdeonService = require('../services/ideonService');

exports.calculateIchraAffordability = async (req, res) => {
  const { groupId } = req.params;

  try {
    const group = await Group.findById(groupId);
    if (!group?.ideon_group_id) {
      return res.status(404).json({ message: 'Group or Ideon group ID not found' });
    }

    const payload = {
      ichra_affordability_calculation: {
        effective_date: "2025-08-01",
        plan_year: 2025,
        rating_area_location: "work"
      }
    };

    const start = await IdeonService.createAffordabilityCalculation(group.ideon_group_id, payload);
    const calcId = start.ichra_affordability_calculation.id;

    let status = null;
    let attempts = 0;
    do {
      await new Promise(r => setTimeout(r, 2000));
      status = await IdeonService.getAffordabilityStatus(calcId);
      attempts++;
    } while (status.status !== 'complete' && attempts < 10);

    const memberDetails = await IdeonService.getAffordabilityMembers(calcId);

    res.status(200).json({
      groupMinContribution: status.minimum_employer_contribution,
      groupFplMinContribution: status.fpl_minimum_employer_contribution,
      members: memberDetails.members
    });
  } catch (err) {
    console.error('❌ Error in affordability calc:', err.message);
    res.status(500).json({ message: 'Affordability calc failed', error: err.message });
  }
};