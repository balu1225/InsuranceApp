// src/models/Member.js
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
  first_name: String,
  last_name: String,
  date_of_birth: String,
  gender: String,
  zip_code: String,
  fips_code: String,
  location_id: String,
  external_id: { type: String, unique: true },
  retiree: Boolean,
  cobra: Boolean,
  last_used_tobacco: String,

  // Financial info
  annual_salary: Number,
  hours_per_week: Number,
  household_income: Number,
  household_size: Number,
  safe_harbor_income: Number,

  // For ICHRA comparison
  old_employer_contribution: Number,
  old_employee_contribution: Number,

  // Ideon ID
  ideon_id: String,

  // Dependents
  dependents: [DependentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Member', MemberSchema);