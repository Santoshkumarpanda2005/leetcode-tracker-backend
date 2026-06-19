const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  scores: { type: Map, of: Number, default: {} }
});

module.exports = mongoose.model('SkillProfile', skillSchema, 'skills');
