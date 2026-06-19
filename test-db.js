require('dotenv').config();
const mongoose = require('mongoose');

console.log("Testing MongoDB connection...");
console.log("URI:", process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@')); // Hide password in logs

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("✅ Successfully connected to MongoDB Cloud!");
        process.exit(0);
    })
    .catch(err => {
        console.error("❌ Failed to connect to MongoDB:");
        console.error(err.message);
        process.exit(1);
    });
