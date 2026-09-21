import express from 'express';
import Groq from 'groq-sdk';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

const getGroqClient = () => {
    if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY missing");
    return new Groq({ apiKey: process.env.GROQ_API_KEY });
};

// 1. Magic Playlist Namer
router.get('/magic-name', protect, async (req, res) => {
    try {
        const groq = getGroqClient();
        const prompt = "Generate a short, aesthetic, and creative name for a music playlist (max 3 words). ONLY return the name, no quotes.";
        
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "qwen/qwen3.8-27b", // Lightning fast model
        });
        
        res.status(200).json({ name: completion.choices[0]?.message?.content.trim() });
    } catch (error) {
        console.error("Magic Namer Error:", error.message);
        res.status(200).json({ name: "Vibe Mix" }); 
    }
});

// 2. Chatbot Suggestions
router.post('/chat', protect, async (req, res) => {
    try {
        const { prompt } = req.body;
        const groq = getGroqClient();
        
        const aiPrompt = `You are a music recommendation AI created by MR.Alok. The user says: "${prompt}". Suggest exactly 5 to 6 song names based on this input. Format the response as a simple numbered list. Do NOT include any extra conversational text. Just the song names and artists.`;
        
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: aiPrompt }],
            model: "qwen/qwen3.8-27b",
        });
        
        res.status(200).json({ reply: completion.choices[0]?.message?.content.trim() });
    } catch (error) {
        console.error("Chatbot Error:", error.message);
        res.status(500).json({ reply: "Oops, I couldn't connect right now. Try again later!" });
    }
});
// ✨ NEW: Diagnostic route to list your available Groq models
router.get('/models', async (req, res) => {
    try {
        const groq = getGroqClient();
        const models = await groq.models.list();
        res.status(200).json(models.data.map(m => m.id));
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;