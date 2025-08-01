// models/Member.js
const mongoose = require('mongoose');

const DependentSchema = new mongoose.Schema({
  first_name: String,
  last_name: String,
  date_of_birth: String,
  gender: String,
  last_used_tobacco: String,
  relationship: String,
  same_household: Boolean,
  id: String // From Ideon
});

const MemberSchema = new mongoose.Schema({
  group_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Group', required: true },
  ichra_class_id: { type: mongoose.Schema.Types.ObjectId, ref: 'IchraClass', required: true },

  // Core info
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  date_of_birth: { type: String, required: true },
  gender: String,
  zip_code: { type: String, required: true },
  fips_code: String,
  location_id: String,
  external_id: { type: String, unique: true },
  retiree: Boolean,
  cobra: Boolean,
  last_used_tobacco: { type: Boolean, default: false },

  // Financial info
  annual_salary: Number,
  hours_per_week: Number,
  household_income: Number,
  household_size: { type: Number, default: 1 },
  safe_harbor_income: Number,

  // ICHRA comparison
  old_employer_contribution: { type: Number, default: 0 },
  old_employee_contribution: { type: Number, default: 0 },

  // Ideon ID (for API sync)
  ideon_id: String,

  // Dependents
  dependents: [DependentSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Member', MemberSchema);