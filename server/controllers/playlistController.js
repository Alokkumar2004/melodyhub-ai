import Playlist from '../models/Playlist.js';
import Groq from 'groq-sdk';

// --- AI Magic Namer Controller ---
export const generateMagicName = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            console.error("AI Magic Name Error: No authenticated user found on request.");
            return res.status(401).json({ message: 'Not authorized, missing user context' });
        }

        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

        // Generate a random seed and timestamp to bypass cache and guarantee unique names
        const randomSeed = Math.floor(Math.random() * 1000000);
        const timestamp = Date.now();

        let chatCompletion;
        
        // Try primary model first, with fallback to avoid 500 crashes
        try {
            chatCompletion = await groq.chat.completions.create({
                messages: [
                    { 
                        role: 'system', 
                        content: `You are a creative music DJ. Generate a short, catchy, unique 2-3 word playlist name. Session: ${timestamp}-${randomSeed}. Make it fresh and completely different. Reply with ONLY the name, no quotes, no extra text.` 
                    }
                ],
                model: 'llama-3.3-70b-versatile', 
                temperature: 1.0, // High temperature for maximum variety
                seed: randomSeed, // Forces non-cached execution
            });
        } catch (primaryError) {
            console.warn("Primary model failed, attempting fallback model...");
            // Fallback attempt if primary model is restricted on your key
            chatCompletion = await groq.chat.completions.create({
                messages: [
                    { 
                        role: 'system', 
                        content: `You are a creative music DJ. Generate a short, catchy, unique 2-3 word playlist name. Session: ${timestamp}-${randomSeed}. Reply with ONLY the name, no quotes, no extra text.` 
                    }
                ],
                model: 'llama3-8b-8192', 
                temperature: 1.0,
                seed: randomSeed,
            });
        }

        let generatedName = chatCompletion.choices[0]?.message?.content?.trim() || 'Vibe Check';
        generatedName = generatedName.replace(/["']/g, ""); 

        res.status(200).json({ name: generatedName });
    } catch (error) {
        console.error("Groq AI Crash Details:", error?.error || error.message || error);
        // Fallback name so the user's mobile app never breaks even if Groq fails entirely
        res.status(200).json({ name: "Chill Mix" });
    }
};

// --- EXISTING CONTROLLERS ---
export const createPlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const playlist = await Playlist.create({
            name: name || 'My New Playlist',
            description: description || '',
            owner: req.user._id,
            songs: []
        });
        res.status(201).json(playlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getUserPlaylists = async (req, res) => {
    try {
        const playlists = await Playlist.find({ owner: req.user._id }).populate('songs');
        res.status(200).json(playlists);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const getSinglePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id).populate('songs');
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        res.status(200).json(playlist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const updatePlaylist = async (req, res) => {
    try {
        const { name, description } = req.body;
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (name) playlist.name = name;
        if (description !== undefined) playlist.description = description;
        await playlist.save();
        const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs');
        res.status(200).json(updatedPlaylist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const addSongToPlaylist = async (req, res) => {
    try {
        const { songId } = req.body;
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        if (playlist.songs.includes(songId)) {
            return res.status(400).json({ message: 'Song already in playlist' });
        }
        playlist.songs.push(songId);
        await playlist.save();
        const updatedPlaylist = await Playlist.findById(req.params.id).populate('songs');
        res.status(200).json(updatedPlaylist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const deletePlaylist = async (req, res) => {
    try {
        const playlist = await Playlist.findById(req.params.id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        await playlist.deleteOne();
        res.status(200).json({ message: 'Playlist removed' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const removeSongFromPlaylist = async (req, res) => {
    try {
        const { id, songId } = req.params;
        const playlist = await Playlist.findById(id);
        if (!playlist) return res.status(404).json({ message: 'Playlist not found' });
        if (playlist.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        playlist.songs = playlist.songs.filter(s => s.toString() !== songId);
        await playlist.save();
        const updatedPlaylist = await Playlist.findById(id).populate('songs');
        res.status(200).json(updatedPlaylist);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};