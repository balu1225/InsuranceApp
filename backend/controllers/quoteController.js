// controllers/quoteController.js
const Member = require('../models/Member');
const IchraClass = require('../models/IchraClass');
const {
  getOffMarketQuotes,
  getOnMarketQuotes
} = require('../services/quoteService');

function applyContribution(quotes, contribution) {
  const total = (contribution?.employee || 0) + (contribution?.dependents || 0);
  return quotes.map(quote => ({
    ...quote,
    ichra_contribution: total,
    employee_cost: Math.max(quote.premium - total, 0)
  }));
}

exports.generateOffMarketQuotes = async (req, res) => {
  const { groupId } = req.params;
  try {
    const members = await Member.find({ group_id: groupId }).lean();
    const ichraClasses = await IchraClass.find({ group_id: groupId }).lean();
    const ichraMap = Object.fromEntries(ichraClasses.map(cls => [cls._id.toString(), cls]));

    const results = [];
    for (const member of members) {
      const ichra = ichraMap[member.ichra_class_id?.toString()];
      const contribution = ichra?.contribution || { employee: 0, dependents: 0 };
      const quotes = await getOffMarketQuotes(member);
      results.push({
        member_id: member._id,
        first_name: member.first_name,
        last_name: member.last_name,
        ichra_class: ichra?.class_name || 'Unknown',
        quotes: applyContribution(quotes || [], contribution)
      });
    }
    res.json({ groupId, quotes: results });
  } catch (err) {
    console.error('❌ Off-market quote generation failed:', err.message);
    res.status(500).json({ error: 'Failed to generate off-market quotes', details: err.message });
  }
};

exports.generateOnMarketQuotes = async (req, res) => {
  const { groupId } = req.params;
  try {
    const members = await Member.find({ group_id: groupId }).lean();
    const ichraClasses = await IchraClass.find({ group_id: groupId }).lean();
    const ichraMap = Object.fromEntries(ichraClasses.map(cls => [cls._id.toString(), cls]));

    const results = [];
    for (const member of members) {
      const ichra = ichraMap[member.ichra_class_id?.toString()];
      const contribution = ichra?.contribution || { employee: 0, dependents: 0 };
      const quotes = await getOnMarketQuotes(member);
      results.push({
        member_id: member._id,
        first_name: member.first_name,
        last_name: member.last_name,
        ichra_class: ichra?.class_name || 'Unknown',
        quotes: applyContribution(quotes || [], contribution)
      });
    }
    res.json({ groupId, quotes: results });
  } catch (err) {
    console.error('❌ On-market quote generation failed:', err.message);
    res.status(500).json({ error: 'Failed to generate on-market quotes', details: err.message });
  }
};

exports.generateAllQuotes = async (req, res) => {
  const { groupId } = req.params;
  try {
    const members = await Member.find({ group_id: groupId }).lean();
    const ichraClasses = await IchraClass.find({ group_id: groupId }).lean();
    const ichraMap = Object.fromEntries(ichraClasses.map(cls => [cls._id.toString(), cls]));

    const results = [];
    for (const member of members) {
      const ichra = ichraMap[member.ichra_class_id?.toString()];
      const contribution = ichra?.contribution || { employee: 0, dependents: 0 };
      const [offQuotes, onQuotes] = await Promise.all([
        getOffMarketQuotes(member),
        getOnMarketQuotes(member)
      ]);
      results.push({
        member_id: member._id,
        first_name: member.first_name,
        last_name: member.last_name,
        ichra_class: ichra?.class_name || 'Unknown',
        off_market_quotes: applyContribution(offQuotes || [], contribution),
        on_market_quotes: applyContribution(onQuotes || [], contribution)
      });
    }
    res.json({ groupId, quotes: results });
  } catch (err) {
    console.error('❌ Error generating all quotes:', err.message);
    res.status(500).json({ error: 'Failed to generate quotes', details: err.message });
  }
};