const mongoose = require('mongoose');
const Member = require('../models/Member');

// Raw collections with flexible schemas
const ZipCounty = mongoose.model('zip_counties', new mongoose.Schema({}, { strict: false }));
const PlanCounty = mongoose.model('plan_counties', new mongoose.Schema({}, { strict: false }));
const Plan = mongoose.model('plans', new mongoose.Schema({}, { strict: false }));
const Issuer = mongoose.model('issuers', new mongoose.Schema({}, { strict: false }));
const Pricing = mongoose.model('pricings', new mongoose.Schema({}, { strict: false }));

function getAgeFromDOB(dob) {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

async function getQuotesByMarket(member, marketType) {
  const age = getAgeFromDOB(member.date_of_birth);
  const ageKey = member.last_used_tobacco ? `age_${age}_tobacco` : `age_${age}`;
  const zipCode = Number(member.zip_code);

  console.log(`🔍 Member: ${member.first_name} ZIP: ${zipCode} Age: ${age} Tobacco: ${!!member.last_used_tobacco} AgeKey: ${ageKey}`);

  const zipRecords = await ZipCounty.find({ zip_code_id: zipCode }).lean();
  console.log(`📦 zip_counties found: ${zipRecords.length}`);

  if (!zipRecords.length) return [];

  const countyIds = zipRecords.map(z => z.county_id);
  console.log('📍 county_ids:', countyIds);

  const planCountyRecords = await PlanCounty.find({ county_id: { $in: countyIds } }).lean();
  console.log(`📦 plan_counties found: ${planCountyRecords.length}`);

  const planIds = [...new Set(planCountyRecords.map(p => p.plan_id))];
  console.log('📍 plan_ids:', planIds.length);

  if (!planIds.length) return [];

  // Apply plan-level market filter
  const planQuery = { id: { $in: planIds } };
  if (marketType === 'on') planQuery.on_market = true;
  else if (marketType === 'off') planQuery.off_market = true;

  const plans = await Plan.find(planQuery).lean();
  if (!plans.length) return [];

  const validPlanIds = plans.map(p => p.id);
  const pricingRecords = await Pricing.find({
    plan_id: { $in: validPlanIds },
    [ageKey]: { $exists: true }
  }).lean();

  if (!pricingRecords.length) return [];

  const issuerIds = [...new Set(plans.map(p => p.hios_issuer_id))];
  const issuers = await Issuer.find({ id: { $in: issuerIds } }).lean();

  const planMap = Object.fromEntries(plans.map(p => [p.id, p]));
  const issuerMap = Object.fromEntries(issuers.map(i => [i.id, i.name]));

  return pricingRecords.map(price => {
    const plan = planMap[price.plan_id];
    if (!plan) return null;

    return {
      plan_id: plan.id,
      name: plan.display_name || plan.name,
      metal_level: plan.level || 'Unknown',
      carrier_name: issuerMap[plan.hios_issuer_id] || 'Unknown',
      premium: price[ageKey],
      age,
      tobacco: !!member.last_used_tobacco
    };
  }).filter(Boolean);
}

// Public methods
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