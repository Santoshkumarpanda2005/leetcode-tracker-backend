const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const activityRoutes = require('./routes/activityRoutes');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/activity', activityRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Successfully connected to MongoDB Cloud'))
  .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`LeetCode Tracker Backend running on http://localhost:${PORT}`);
});
