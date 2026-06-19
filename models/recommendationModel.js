const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  problems: { type: [String], default: [] }
});

module.exports = mongoose.model('Recommendation', recommendationSchema);
