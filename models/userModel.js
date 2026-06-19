const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true // Allows null/missing emails for ghost accounts
  },
  password: {
    type: String,
    required: false
  },
  leetcodeUsername: {
    type: String,
    required: true,
    unique: true
  },
  name: { type: String, default: "" },
  phoneNumber: { type: String, default: "" },
  gender: { 
    type: String, 
    enum: ['Male', 'Female', 'Other', 'Prefer not to say', ''], 
    default: '' 
  },
  dateOfBirth: { type: Date, default: null },
  bio: { type: String, default: "" },
  githubUrl: { type: String, default: "" },
  linkedinUrl: { type: String, default: "" },
  avatar: { type: String, default: "" }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
