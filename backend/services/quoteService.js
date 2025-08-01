// quoteService.js
const mongoose = require('mongoose');

const ZipCounty = mongoose.model('zip_counties', new mongoose.Schema({}, { strict: false }));
const PlanCounty = mongoose.model('plan_counties', new mongoose.Schema({}, { strict: false }));
const Plan = mongoose.model('plans', new mongoose.Schema({}, { strict: false }));
const Issuer = mongoose.model('issuers', new mongoose.Schema({}, { strict: false }));
const Pricing = mongoose.model('pricings', new mongoose.Schema({}, { strict: false }));
const FPL = mongoose.model('fpl', new mongoose.Schema({}, { strict: false }));
const SlidingScale = mongoose.model('irs_sliding_scale', new mongoose.Schema({}, { strict: false }));

function getAgeFromDOB(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  if (
    today.getMonth() < birthDate.getMonth() ||
    (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

function deduplicateByPlanId(quotes) {
  const map = new Map();
  for (const quote of quotes) {
    const existing = map.get(quote.plan_id);
    if (!existing || quote.final_premium < existing.final_premium) {
      map.set(quote.plan_id, quote);
    }
  }
  return [...map.values()];
}

async function calculateSubsidy(member, countyId) {
  const age = getAgeFromDOB(member.date_of_birth);
  const ageKey = member.last_used_tobacco ? `age_${age}_tobacco` : `age_${age}`;

  const silverPlanIds = await PlanCounty.find({ county_id: countyId }).distinct('plan_id');
  const silverPlans = await Plan.find({ id: { $in: silverPlanIds }, level: 'silver', on_market: true }).lean();
  const silverPlanIdList = silverPlans.map(p => p.id);
  const silverPricing = await Pricing.find({
    plan_id: { $in: silverPlanIdList },
    [ageKey]: { $exists: true }
  }).lean();

  const sortedPrices = silverPricing
    .map(p => p[ageKey])
    .filter(p => typeof p === 'number')
    .sort((a, b) => a - b);

  const benchmark = sortedPrices[1];
  if (!benchmark) return { subsidy: 0, benchmark: 0, expectedContribution: 0 };

  const MAGI = member.income || 0;
  const householdSize = member.household_size || 1;

  const fplRecord = await FPL.findOne({ household_size: householdSize }).lean();
  if (!fplRecord) return { subsidy: 0, benchmark, expectedContribution: 0 };
  const fplAmount = fplRecord.amount;

  const fplPercent = (MAGI / fplAmount) * 100;
  const scale = await SlidingScale.findOne({
    fpl_min: { $lte: fplPercent },
    fpl_max: { $gte: fplPercent }
  }).lean();

  const applicablePercent = scale?.applicable_percentage || 0;
  const expectedContribution = (MAGI * applicablePercent) / 100;

  const subsidy = Math.max(benchmark - expectedContribution, 0);
  return { subsidy, benchmark, expectedContribution };
}

async function getQuotesByMarket(member, marketType) {
  const age = getAgeFromDOB(member.date_of_birth);
  const ageKey = member.last_used_tobacco ? `age_${age}_tobacco` : `age_${age}`;
  const zipCode = Number(member.zip_code);

  const zipRecords = await ZipCounty.find({ zip_code_id: zipCode }).lean();
  if (!zipRecords.length) return [];

  const countyIds = zipRecords.map(z => z.county_id);
  const planCountyRecords = await PlanCounty.find({ county_id: { $in: countyIds } }).lean();
  const planIds = planCountyRecords.map(p => p.plan_id);
  if (!planIds.length) return [];

  const planQuery = { id: { $in: planIds } };
  if (marketType === 'on') planQuery.on_market = true;
  else if (marketType === 'off') planQuery.off_market = true;

  const plans = await Plan.find(planQuery).lean();
  const filteredPlanIds = plans.map(p => p.id);
  if (!filteredPlanIds.length) return [];

  const pricingRecords = await Pricing.find({
    plan_id: { $in: filteredPlanIds },
    [ageKey]: { $exists: true }
  }).lean();
  if (!pricingRecords.length) return [];

  const issuerIds = [...new Set(plans.map(p => p.hios_issuer_id))];
  const issuers = await Issuer.find({ id: { $in: issuerIds } }).lean();

  const planMap = Object.fromEntries(plans.map(p => [p.id, p]));
  const issuerMap = Object.fromEntries(issuers.map(i => [i.id, i.name]));

  let subsidyInfo = { subsidy: 0, benchmark: 0, expectedContribution: 0 };
  if (marketType === 'on') {
    subsidyInfo = await calculateSubsidy(member, countyIds[0]);
  }

  const quotes = pricingRecords.map(price => {
    const plan = planMap[price.plan_id];
    if (!plan) return null;

    const fullPremium = price[ageKey];
    const finalPremium = marketType === 'on'
      ? Math.max(fullPremium - subsidyInfo.subsidy, 0)
      : fullPremium;

    return {
      plan_id: plan.id,
      name: plan.display_name || plan.name,
      metal_level: plan.level || 'Unknown',
      carrier_name: issuerMap[plan.hios_issuer_id] || 'Unknown',
      full_premium: fullPremium,
      subsidy_applied: marketType === 'on' ? subsidyInfo.subsidy : 0,
      final_premium: finalPremium,
      benchmark_premium: marketType === 'on' ? subsidyInfo.benchmark : undefined,
      expected_contribution: marketType === 'on' ? subsidyInfo.expectedContribution : undefined,
      age,
      tobacco: !!member.last_used_tobacco
    };
  }).filter(Boolean);

  return deduplicateByPlanId(quotes);
}

async function getOffMarketQuotes(member) {
  return getQuotesByMarket(member, 'off');
}

async function getOnMarketQuotes(member) {
  return getQuotesByMarket(member, 'on');
}

module.exports = {
  getOffMarketQuotes,
  getOnMarketQuotes
};