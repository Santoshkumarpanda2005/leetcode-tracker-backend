require('dotenv').config();
const express = require('express');
const cors = require('cors');
const activityRoutes = require('./routes/activityRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/activity', activityRoutes);

app.listen(PORT, () => {
    console.log(`LeetCode Tracker Backend running on http://localhost:${PORT}`);
});
