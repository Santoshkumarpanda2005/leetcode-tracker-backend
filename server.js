require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Successfully connected to MongoDB Cloud'))
    .catch(err => console.error('Failed to connect to MongoDB:', err));

// Routes
app.use('/api/activity', activityRoutes);

app.listen(PORT, () => {
    console.log(`LeetCode Tracker Backend running on http://localhost:${PORT}`);
});
