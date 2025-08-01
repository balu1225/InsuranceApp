// models/slidingScale.js
const mongoose = require('mongoose');
const slidingScaleSchema = new mongoose.Schema({
  min_fpl_percent: Number,
  max_fpl_percent: Number,
  applicable_percentage: Number // example: 0.0862 for 8.62%
});
module.exports = mongoose.model('SlidingScale', slidingScaleSchema);