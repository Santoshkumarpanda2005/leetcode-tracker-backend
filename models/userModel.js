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
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
