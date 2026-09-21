import Song from '../models/Song.js';
import User from '../models/User.js';
import Groq from 'groq-sdk';

// Helper to attach isLiked status if user is logged in
const attachLikeStatus = (songs, user) => {
    if (!user || !user.likedSongs) return songs;
    const likedSet = new Set(user.likedSongs.map(id => id.toString()));
    
    // Map songs to include isLiked boolean property
    return songs.map(song => {
        const songObj = song.toObject ? song.toObject() : { ...song };
        const songId = songObj._id ? songObj._id.toString() : songObj.id?.toString();
        songObj.isLiked = likedSet.has(songId);
        return songObj;
    });
};

export const getSongCategories = async (req, res) => {
    try {
        // Try to fetch current user to check liked songs if auth header is present
        let user = null;
        if (req.headers.authorization) {
            // Optional: if your auth middleware populates req.user, use it, else skip safely
            user = req.user; 
        }

        let popular = await Song.find({ genre: { $regex: /party|dance|bollywood|happy|pop/i } }).limit(16);
        if (popular.length < 16) popular = await Song.find({}).limit(16);

        let topArtists = await Song.find({ genre: { $regex: /romantic|classic|sad|acoustic/i } }).limit(16);
        if (topArtists.length < 16) topArtists = await Song.find({}).skip(16).limit(16);

        let allTimeHits = await Song.find({}).sort({ createdAt: -1 }).limit(16);
        if (allTimeHits.length < 16) allTimeHits = await Song.find({}).limit(16);

        res.status(200).json({ 
            popular: attachLikeStatus(popular, user), 
            topArtists: attachLikeStatus(topArtists, user), 
            allTimeHits: attachLikeStatus(allTimeHits, user) 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ✨ NEW: Advanced Collaborative Filtering Recommendation Engine
export const getRecommendations = async (req, res) => {
    try {
        // If user is not logged in, return general hits
        if (!req.user || !req.user._id) {
            const fallbackSongs = await Song.find({}).limit(16);
            return res.status(200).json(attachLikeStatus(fallbackSongs, null));
        }

        const currentUser = await User.findById(req.user._id);

        // COLD START: If user hasn't liked anything yet, return general hits
        if (!currentUser.likedSongs || currentUser.likedSongs.length === 0) {
            const fallbackSongs = await Song.find({}).limit(16);
            return res.status(200).json(attachLikeStatus(fallbackSongs, currentUser));
        }

        const currentLikedIds = currentUser.likedSongs.map(id => id.toString());

        // 1. FIND SIMILAR USERS (Users who liked at least one song this user likes)
        const similarUsers = await User.find({
            _id: { $ne: currentUser._id },
            likedSongs: { $in: currentUser.likedSongs }
        });

        // 2. CALCULATE WEIGHTED SCORES
        const songScores = {};

        similarUsers.forEach(otherUser => {
            const otherLikedIds = otherUser.likedSongs.map(id => id.toString());
            
            // Weight = How many songs they have in common
            const sharedLikesCount = otherLikedIds.filter(id => currentLikedIds.includes(id)).length;
            
            otherLikedIds.forEach(songId => {
                // Only recommend songs the current user hasn't liked yet
                if (!currentLikedIds.includes(songId)) {
                    if (!songScores[songId]) songScores[songId] = 0;
                    songScores[songId] += sharedLikesCount; 
                }
            });
        });

        // 3. SORT & EXTRACT TOP RECOMMENDATIONS
        const topRecommendedIds = Object.keys(songScores)
            .sort((a, b) => songScores[b] - songScores[a])
            .slice(0, 16);

        let recommendedSongs = [];
        if (topRecommendedIds.length > 0) {
            recommendedSongs = await Song.find({ _id: { $in: topRecommendedIds } });
        }

        // 4. HYBRID FALLBACK: If CF yields fewer than 16 songs, fill using user's favorite genres
        if (recommendedSongs.length < 16) {
            const likedSongsDocs = await Song.find({ _id: { $in: currentUser.likedSongs } });
            const likedGenres = [...new Set(likedSongsDocs.map(song => song.genre).filter(Boolean))];
            
            const extraSongs = await Song.find({
                genre: { $in: likedGenres.map(g => new RegExp(g, 'i')) },
                _id: { $nin: [...currentUser.likedSongs, ...topRecommendedIds] }
            }).limit(16 - recommendedSongs.length);
            
            recommendedSongs = [...recommendedSongs, ...extraSongs];
        }

        // 5. IF STILL SHORT: Pad with random popular songs
        if (recommendedSongs.length < 16) {
            const padSongs = await Song.find({
                _id: { $nin: [...currentUser.likedSongs, ...recommendedSongs.map(s => s._id)] }
            }).limit(16 - recommendedSongs.length);
            recommendedSongs = [...recommendedSongs, ...padSongs];
        }

        res.status(200).json(attachLikeStatus(recommendedSongs, currentUser));
    } catch (error) {
        console.error("Collaborative Filtering Error:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

export const searchSongs = async (req, res) => {
    try {
        const { q, genre } = req.query;
        let query = {};

        if (q && q.trim() !== '' && q !== 'undefined') {
            query.$or = [
                { title: { $regex: q,$options: 'i' } },
                { artist: { $regex: q,$options: 'i' } }
            ];
        }

        if (genre && genre !== 'All' && genre !== 'undefined') {
            query.genre = { $regex: new RegExp(`^${genre}$`, 'i') };
        }

        let songs = await Song.find(query).limit(200);
        
        // ✨ AI "Did You Mean?" Typo Fixer Fallback powered by Groq
        if (songs.length === 0 && q && q.trim() !== '' && q !== 'undefined') {
            try {
                const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
                
                const prompt = `Fix spelling mistakes in this song search: "${q}". ONLY return the corrected text, no quotes, no extra words. If it's correct, return it as is.`;
                
                const completion = await groq.chat.completions.create({
                    messages: [{ role: "user", content: prompt }],
                    model: "qwen/qwen3.8-27b", // Lightning-fast text correction
                });
                
                const correctedQuery = completion.choices[0]?.message?.content.trim();

                // If AI found a typo and fixed it, run the database search again
                if (correctedQuery && correctedQuery.toLowerCase() !== q.toLowerCase()) {
                    songs = await Song.find({
                        $or: [
                            { title: { $regex: correctedQuery,$options: 'i' } },
                            { artist: { $regex: correctedQuery,$options: 'i' } }
                        ]
                    }).limit(200);
                }
            } catch (aiError) {
                console.error("AI Fallback failed:", aiError.message);
            }
        }
        
        // If user token is passed through middleware, attach correct like status
        let user = req.user || null;
        if (!user && req.headers.authorization) {
            try {} catch (e) {}
        }

        res.status(200).json(attachLikeStatus(songs, user));
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Toggle like status of a song and save to user's library / liked tracks
// @route   POST /api/songs/like
export const toggleLikeSong = async (req, res) => {
    try {
        const { songId } = req.body;
        
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.likedSongs) {
            user.likedSongs = [];
        }

        // Fixed type-safe string comparison for ObjectIds
        const songIndex = user.likedSongs.findIndex(id => id.toString() === songId.toString());
        let isLiked = false;

        if (songIndex > -1) {
            // Already liked -> Remove (unlike)
            user.likedSongs.splice(songIndex, 1);
            isLiked = false;
        } else {
            // Not liked -> Add (like)
            user.likedSongs.push(songId);
            isLiked = true;
        }

        await user.save();
        res.status(200).json({ 
            message: isLiked ? 'Song added to Liked Songs' : 'Song removed from Liked Songs', 
            isLiked, 
            likedSongs: user.likedSongs 
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get user's populated liked songs
// @route   GET /api/songs/liked
export const getLikedSongs = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.user._id);
        if (!user || !user.likedSongs || user.likedSongs.length === 0) {
            return res.status(200).json([]); // Return empty array if no likes
        }

        // Fetch all songs where the ID is inside the user's likedSongs array
        const likedSongs = await Song.find({ _id: { $in: user.likedSongs } });
        
        // Force the isLiked property to true so the heart shows as green on this page
        const formattedSongs = likedSongs.map(song => {
            const songObj = song.toObject ? song.toObject() : { ...song };
            songObj.isLiked = true;
            return songObj;
        });

        res.status(200).json(formattedSongs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// ------------------------------------------------------------------
// ADMIN DASHBOARD ROUTES
// ------------------------------------------------------------------

// @desc    Get ALL songs (Admin Dashboard)
// @route   GET /api/songs
export const getAllSongs = async (req, res) => {
    try {
        // Fetch all songs sorted by newest first
        const songs = await Song.find({}).sort({ createdAt: -1 });
        res.status(200).json(songs);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Create a new song with file uploads (Admin)
// @route   POST /api/songs
export const createSong = async (req, res) => {
    try {
        const { title, artist, genre, duration } = req.body;
        
        let coverImagePath = '';
        let audioUrlPath = '';

        // Extract the file paths and match your specific multer folder structure
        if (req.files) {
            if (req.files.image && req.files.image.length > 0) {
                // Point to the images folder
                coverImagePath = `/uploads/images/${req.files.image[0].filename}`;
            }
            if (req.files.audio && req.files.audio.length > 0) {
                // Point to the audio folder
                audioUrlPath = `/uploads/audio/${req.files.audio[0].filename}`;
            }
        }

        const newSong = new Song({
            title,
            artist,
            genre: genre || 'Unknown',
            duration: duration || '0:00',
            coverImage: coverImagePath,
            image: coverImagePath,     
            audioUrl: audioUrlPath,
            url: audioUrlPath          
        });

        await newSong.save();
        res.status(201).json(newSong);
    } catch (error) {
        console.error("Error creating song:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Delete a song (Admin)
// @route   DELETE /api/songs/:id
export const deleteSong = async (req, res) => {
    try {
        const song = await Song.findById(req.params.id);
        if (!song) {
            return res.status(404).json({ message: 'Song not found' });
        }
        
        await song.deleteOne();
        res.status(200).json({ message: 'Song deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};