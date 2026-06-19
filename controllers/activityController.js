const { GoogleGenAI } = require('@google/genai');
const ActivityModel = require('../models/activityModel');

// Initialize Gemini API
const ai = new GoogleGenAI({});

const trackActivity = async (req, res) => {
    try {
        const data = req.body;
        console.log(`\n--- Received activity data for: ${data.problemName} ---`);

        let timeComplexity = "Unknown";
        let spaceComplexity = "Unknown";

        if (data.code && data.code.trim().length > 0) {
            try {
                console.log("Analyzing code complexity with Gemini...");
                const prompt = `Analyze the following code snippet and determine its time and space complexity in Big-O notation. 
Return ONLY a valid JSON object with the exact keys "timeComplexity" and "spaceComplexity". 
Do not include any other text, markdown formatting, or explanations.
Example output: {"timeComplexity": "O(n log n)", "spaceComplexity": "O(1)"}

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
                    console.log("AI Complexity Analysis:", aiResult);
                }
            } catch (aiError) {
                console.error("Error calling Gemini API:", aiError.message);
            }
        }

        const finalRecord = {
            ...data,
            timeComplexity,
            spaceComplexity,
            timestamp: new Date().toISOString()
        };

        // Save to MongoDB via Mongoose model
        const newActivity = new ActivityModel(finalRecord);
        await newActivity.save();

        console.log("Record successfully saved to MongoDB Cloud.");
        res.status(200).json({ success: true, message: "Activity tracked successfully", data: finalRecord });

    } catch (error) {
        console.error("Server Error:", error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

const getActivity = async (req, res) => {
    try {
        const query = req.query.username ? { username: req.query.username } : {};
        const records = await ActivityModel.find(query).sort({ createdAt: -1 });
        res.json(records);
    } catch (err) {
        console.error("Database read error:", err);
        res.status(500).json({ error: "Failed to read from database" });
    }
};

module.exports = {
    trackActivity,
    getActivity
};
