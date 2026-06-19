const { GoogleGenAI } = require('@google/genai');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const SkillProfile = require('../models/SkillProfile');
const Recommendation = require('../models/Recommendation');

const ai = new GoogleGenAI({});

const trackActivity = async (req, res) => {
    try {
        const data = req.body;
        const leetcodeUsername = data.username || "Anonymous";
        
        console.log(`\n--- Received activity data for: ${data.problemName} (${leetcodeUsername}) ---`);

        // 1. Find or Create User
        let user = await User.findOne({ leetcodeUsername });
        if (!user) {
            user = new User({ leetcodeUsername });
            await user.save();
            console.log(`Created new user profile for: ${leetcodeUsername}`);
        }

        // 2. Analyze Code Complexity & Generate Recommendations
        let timeComplexity = "Unknown";
        let spaceComplexity = "Unknown";
        let recommendations = [];

        if (data.code && data.code.trim().length > 0) {
            try {
                console.log("Analyzing code complexity with Gemini...");
                const prompt = `Analyze the following code snippet and determine its time and space complexity in Big-O notation. 
Then, based on the problem topics (${(data.topic || []).join(', ')}), recommend exactly 3 related LeetCode problems the user should solve next to improve.
Return ONLY a valid JSON object with the exact keys "timeComplexity", "spaceComplexity", and "recommendedProblems" (array of strings). 
Do not include any other text, markdown formatting, or explanations.
Example output: {"timeComplexity": "O(n log n)", "spaceComplexity": "O(1)", "recommendedProblems": ["3Sum", "Container With Most Water", "Trapping Rain Water"]}

Code:
${data.code}`;

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                let aiText = response.text;
                if (aiText) {
                    aiText = aiText.replace(/```json/g, '').replace(/```/g, '').trim();
                    const aiResult = JSON.parse(aiText);
                    timeComplexity = aiResult.timeComplexity || "Unknown";
                    spaceComplexity = aiResult.spaceComplexity || "Unknown";
                    recommendations = aiResult.recommendedProblems || [];
                    console.log("AI Output:", aiResult);
                }
            } catch (aiError) {
                console.error("Error calling Gemini API:", aiError.message);
            }
        }

        // 3. Create Activity Log
        const newLog = new ActivityLog({
            userId: user._id,
            problemName: data.problemName,
            difficulty: data.difficulty,
            topic: data.topic || [],
            timeSpent: data.timeSpent,
            attempts: data.attempts,
            accepted: data.accepted,
            runtime: data.runtime,
            memory: data.memory,
            code: data.code,
            language: data.language,
            timeComplexity,
            spaceComplexity
        });
        await newLog.save();

        // 4. Update Skill Profile
        let profile = await SkillProfile.findOne({ userId: user._id });
        if (!profile) {
            profile = new SkillProfile({ userId: user._id, scores: {} });
        }
        
        if (data.topic && Array.isArray(data.topic)) {
            for (let topic of data.topic) {
                const currentScore = profile.scores.get(topic) || 0;
                profile.scores.set(topic, currentScore + 1); // +1 point for each solved problem in this topic
            }
        }
        await profile.save();

        // 5. Update Recommendations
        if (recommendations.length > 0) {
            let recDoc = await Recommendation.findOne({ userId: user._id });
            if (!recDoc) {
                recDoc = new Recommendation({ userId: user._id, problems: recommendations });
            } else {
                recDoc.problems = recommendations; // Overwrite with latest recommendations
            }
            await recDoc.save();
        }

        console.log("Activity processed and saved across relational models.");
        res.status(200).json({ success: true, message: "Activity tracked successfully" });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getActivity = async (req, res) => {
    try {
        const query = req.query.username ? { leetcodeUsername: req.query.username } : {};
        
        // Find users matching query
        const users = await User.find(query);
        const userIds = users.map(u => u._id);

        if (userIds.length === 0) {
            return res.json({ activities: [], skillProfiles: [], recommendations: [] });
        }

        // Fetch related data
        const logs = await ActivityLog.find({ userId: { $in: userIds } }).sort({ createdAt: -1 }).populate('userId', 'leetcodeUsername');
        const profiles = await SkillProfile.find({ userId: { $in: userIds } }).populate('userId', 'leetcodeUsername');
        const recs = await Recommendation.find({ userId: { $in: userIds } }).populate('userId', 'leetcodeUsername');

        res.json({
            activities: logs,
            skillProfiles: profiles,
            recommendations: recs
        });

    } catch (err) {
        console.error("Database read error:", err);
        res.status(500).json({ error: "Failed to read from database" });
    }
};

module.exports = {
    trackActivity,
    getActivity
};
