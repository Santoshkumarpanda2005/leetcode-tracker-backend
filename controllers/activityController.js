const Activity = require('../models/ActivityLog');
const SkillProfile = require('../models/skillModel');
const User = require('../models/userModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

exports.trackActivity = async (req, res) => {
    try {
        const { problemName, difficulty, topic, timeSpent, attempts, accepted, runtime, memory, code, language } = req.body;
        const userId = req.user.sub; // From authMiddleware

        console.log(`--- Received activity data for: ${problemName} ---`);

        let timeComplexity = "Unknown";
        let spaceComplexity = "Unknown";
        let recommendedProblems = [];

        if (code && code.trim() !== "") {
            try {
                console.log("Analyzing code complexity with Gemini...");
                const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
                const prompt = `Analyze the following code snippet and determine its time and space complexity in Big-O notation. 
Then, based on the problem topics (${topic.join(', ')}), recommend exactly 3 related LeetCode problems.
Return ONLY a valid JSON object with the exact keys "timeComplexity", "spaceComplexity", and "recommendedProblems" (array of strings). 
Do not include any other text, markdown formatting, or explanations.

Code:
${code}`;
                
                const result = await model.generateContent(prompt);
                const response = result.response.text();
                
                const cleanJsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
                const aiResult = JSON.parse(cleanJsonStr);

                timeComplexity = aiResult.timeComplexity || "Unknown";
                spaceComplexity = aiResult.spaceComplexity || "Unknown";
                recommendedProblems = aiResult.recommendedProblems || [];
            } catch (aiError) {
                console.error("Error calling Gemini API:", aiError.message || aiError);
            }
        }

        const newActivity = new Activity({
            userId,
            problemName,
            difficulty,
            topic,
            timeSpent,
            attempts,
            accepted,
            runtime,
            memory,
            code,
            language,
            timeComplexity,
            spaceComplexity,
            recommendations: recommendedProblems
        });

        await newActivity.save();

        // Update Skill Profile
        let skillProfile = await SkillProfile.findOne({ userId });
        if (!skillProfile) {
            skillProfile = new SkillProfile({ userId, scores: {} });
        }
        for (let t of topic) {
            let currentScore = skillProfile.scores.get(t) || 0;
            skillProfile.scores.set(t, currentScore + 1);
        }
        await skillProfile.save();

        console.log("Activity processed and saved across relational models.");
        res.status(201).json({ message: 'Activity tracked successfully' });
    } catch (error) {
        console.error("Error tracking activity:", error);
        res.status(500).json({ error: 'Server error tracking activity' });
    }
};

exports.getActivity = async (req, res) => {
    try {
        const userId = req.user.sub;
        
        // Find by either string userId or ObjectId userId for backwards compatibility
        const mongoose = require('mongoose');
        const userIdsToCheck = [userId];
        if (mongoose.Types.ObjectId.isValid(userId)) {
            userIdsToCheck.push(new mongoose.Types.ObjectId(userId));
        }

        const activities = await Activity.find({ userId: { $in: userIdsToCheck } }).sort({ createdAt: -1 }).limit(100);
        const skillProfile = await SkillProfile.findOne({ userId: { $in: userIdsToCheck } });
        
        let user = null;
        for (const id of userIdsToCheck) {
            user = await User.findById(id);
            if (user) break;
        }

        const totalProblemsSolved = activities.length;
        const totalTimeSpent = activities.reduce((total, act) => total + (act.timeSpent || 0), 0);

        res.json({
            user: user ? { 
                email: user.email, 
                leetcodeUsername: user.leetcodeUsername, 
                createdAt: user.createdAt 
            } : null,
            profileStats: {
                totalProblemsSolved,
                totalTimeSpent
            },
            activities,
            skillProfile: skillProfile ? Object.fromEntries(skillProfile.scores) : {}
        });
    } catch (error) {
        console.error("Error fetching activity:", error);
        res.status(500).json({ error: 'Server error fetching activity' });
    }
};
