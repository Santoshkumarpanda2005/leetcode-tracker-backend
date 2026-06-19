const mongoose = require('mongoose');

const skillProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    scores: { 
        type: Map, 
        of: Number, 
        default: {} 
    }
}, { timestamps: true });

const SkillProfile = mongoose.models.SkillProfile || mongoose.model('SkillProfile', skillProfileSchema);
module.exports = SkillProfile;
