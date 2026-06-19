const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    problemName: { type: String, required: true },
    difficulty: { type: String },
    topic: [{ type: String }],
    timeSpent: { type: Number },
    attempts: { type: Number },
    accepted: { type: Boolean },
    runtime: { type: String },
    memory: { type: String },
    code: { type: String },
    language: { type: String },
    timeComplexity: { type: String },
    spaceComplexity: { type: String }
}, { timestamps: true });

const ActivityLog = mongoose.models.ActivityLog || mongoose.model('ActivityLog', activityLogSchema);
module.exports = ActivityLog;
