const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    problems: [{ type: String }]
}, { timestamps: true });

const Recommendation = mongoose.models.Recommendation || mongoose.model('Recommendation', recommendationSchema);
module.exports = Recommendation;
