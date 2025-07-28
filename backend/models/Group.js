const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: String,
  zip_code: String,
  fips_code: String,
  number_of_employees: Number,
  primary: Boolean,
  external_id: String,
  ideon_location_id: String
});

const groupSchema = new mongoose.Schema({
  chamber_association: Boolean,
  company_name: String,
  contact_name: String,
  contact_email: String,
  contact_phone: String,
  external_id: { type: String, unique: true },
  sic_code: String,
  ideon_group_id: String,
  locations: [locationSchema]
});

module.exports = mongoose.model('Group', groupSchema);