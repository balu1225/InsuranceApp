
const mongoose = require('mongoose');
const fplSchema = new mongoose.Schema({
  household_size: Number,
  year: Number,
  fpl_amount: Number
});
module.exports = mongoose.model('FPL', fplSchema);