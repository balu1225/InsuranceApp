// 🔧 utils/subsidyUtils.js
const FPL_TABLE = {
  1: 14580,
  2: 19720,
  3: 24860,
  4: 30000,
  5: 35140,
  6: 40280
};

const IRS_APPLICABLE_PERCENTAGE = [
  { fpl: 1.0, percentage: 0.0 },
  { fpl: 1.33, percentage: 0.02 },
  { fpl: 1.5, percentage: 0.04 },
  { fpl: 2.0, percentage: 0.06 },
  { fpl: 2.5, percentage: 0.08 },
  { fpl: 3.0, percentage: 0.095 },
  { fpl: 4.0, percentage: 0.095 }
];

function getFPL(householdSize) {
  return FPL_TABLE[householdSize] || FPL_TABLE[6];
}

function getApplicablePercentage(fplRatio) {
  for (let i = IRS_APPLICABLE_PERCENTAGE.length - 1; i >= 0; i--) {
    if (fplRatio >= IRS_APPLICABLE_PERCENTAGE[i].fpl) {
      return IRS_APPLICABLE_PERCENTAGE[i].percentage;
    }
  }
  return 0.0;
}

function calculateExpectedContribution(magi, householdSize) {
  const fpl = getFPL(householdSize);
  const fplRatio = magi / fpl;
  const applicablePercentage = getApplicablePercentage(fplRatio);
  return Math.round(magi * applicablePercentage);
}

module.exports = {
  calculateExpectedContribution,
  getFPL,
  getApplicablePercentage
};
