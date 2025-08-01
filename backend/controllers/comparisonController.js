const Member = require('../models/Member');
const IchraClass = require('../models/IchraClass');
const Group = require('../models/Group');

// GET /api/comparison/:groupId
exports.generateComparison = async (req, res) => {
  try {
    const { groupId } = req.params;

    const members = await Member.find({ group_id: groupId }).lean();
    const ichraClasses = await IchraClass.find({ group_id: groupId }).lean();

    const ichraMap = Object.fromEntries(ichraClasses.map(cls => [cls._id.toString(), cls]));

    let totalOldEmployer = 0;
    let totalNewEmployer = 0;

    const employeeSummaries = members.map(member => {
      const ichra = ichraMap[member.ichra_class_id?.toString()];
      const contribution = ichra?.contribution || { employee: 0, dependents: 0 };

      const oldEmployer = member.old_employer_contribution || 0;
      const oldEmployee = member.old_employee_contribution || 0;
      const newEmployer = (contribution.employee || 0) + (contribution.dependents || 0);
      const newEmployee = 0; // Since no quote is selected yet

      totalOldEmployer += oldEmployer;
      totalNewEmployer += newEmployer;

      return {
        member_id: member._id,
        first_name: member.first_name,
        last_name: member.last_name,
        ichra_class: ichra?.class_name || 'Unknown',
        old_employer_contribution: oldEmployer,
        old_employee_contribution: oldEmployee,
        new_employer_contribution: newEmployer,
        new_employee_contribution: newEmployee,
        monthly_savings: oldEmployer - newEmployer,
        annual_savings: (oldEmployer - newEmployer) * 12
      };
    });

    const response = {
      group_id: groupId,
      total_old_employer_contribution: totalOldEmployer,
      total_new_employer_contribution: totalNewEmployer,
      total_monthly_savings: totalOldEmployer - totalNewEmployer,
      total_annual_savings: (totalOldEmployer - totalNewEmployer) * 12,
      employees: employeeSummaries
    };

    res.json(response);
  } catch (err) {
    console.error('Comparison generation failed:', err.message);
    res.status(500).json({ error: 'Comparison generation failed', details: err.message });
  }
};