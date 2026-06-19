const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    problemName: { type: String, required: true },
    username: { type: String, default: "Anonymous" },
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
    spaceComplexity: { type: String },
    timestamp: { type: Date, default: Date.now }
}, { 
    timestamps: true 
});

// Avoid OverwriteModelError in serverless environments
const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema);

module.exports = Activity;
