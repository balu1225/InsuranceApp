const Member = require('../models/Member');
const IchraClass = require('../models/IchraClass');
const { getOffMarketQuotes } = require('../services/quoteService');

exports.generateGroupComparison = async (req, res) => {
  const { groupId } = req.params;

  try {
    const members = await Member.find({ group_id: groupId }).lean();
    if (!members.length) {
      return res.status(404).json({ message: 'No members found for group' });
    }

    // Fetch all ICHRA classes for contribution lookup
    const classMap = {};
    const classes = await IchraClass.find({ group_id: groupId }).lean();
    for (const cls of classes) {
      classMap[cls._id.toString()] = cls;
    }

    let totalOldEmployer = 0;
    let totalNewEmployer = 0;
    let comparisonData = [];

    for (const member of members) {
      const quotes = await getOffMarketQuotes(member);
      if (!quotes || !quotes.length) continue;

      // Pick cheapest plan
      const cheapestPlan = quotes.reduce((min, q) => (q.premium < min.premium ? q : min), quotes[0]);

      const ichraClass = classMap[member.ichra_class_id?.toString()];
      if (!ichraClass) continue;

      const employerContrib = ichraClass.contribution.employee;
      const oldEmployerContrib = member.old_employer_contribution || 0;
      const oldEmployeeContrib = member.old_employee_contribution || 0;

      totalOldEmployer += oldEmployerContrib;
      totalNewEmployer += employerContrib;

      const newEmployeeCost = Math.max(cheapestPlan.premium - employerContrib, 0);

      comparisonData.push({
        member_id: member._id,
        name: `${member.first_name} ${member.last_name}`,
        old_employee_cost: oldEmployeeContrib,
        new_cost_after_ichra: newEmployeeCost,
        monthly_savings: oldEmployeeContrib - newEmployeeCost,
        annual_savings: (oldEmployeeContrib - newEmployeeCost) * 12
      });
    }

    res.json({
      group_id: groupId,
      total_old_employer_cost: totalOldEmployer,
      total_new_employer_cost: totalNewEmployer,
      total_monthly_savings: totalOldEmployer - totalNewEmployer,
      members: comparisonData
    });

  } catch (err) {
    console.error('❌ Error generating comparison:', err.message);
    res.status(500).json({ error: 'Comparison generation failed', details: err.message });
  }
};