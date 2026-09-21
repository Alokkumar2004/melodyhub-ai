import express from 'express';
import { 
    getSongCategories, 
    getRecommendations, 
    searchSongs, 
    toggleLikeSong,
    getLikedSongs,
    getAllSongs,
    createSong,
    deleteSong 
} from '../controllers/songController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js'; 

const router = express.Router();

// ------------------------------------------------------------------
// APP INTERFACE ROUTES
// ------------------------------------------------------------------

// Home page categories (Trending, Hits, etc.)
router.get('/categories', protect, getSongCategories);

// ✨ Now powered by your Advanced Collaborative Filtering Engine!
router.get('/recommendations', protect, getRecommendations);

// AI-powered Search with Groq Typo-Fixer
router.get('/search', protect, searchSongs);

// ------------------------------------------------------------------
// USER LIBRARY ROUTES
// ------------------------------------------------------------------
router.get('/liked', protect, getLikedSongs);
router.post('/like', protect, toggleLikeSong);

// ------------------------------------------------------------------
// ADMIN DASHBOARD ROUTES
// ------------------------------------------------------------------
router.route('/')
    .get(protect, getAllSongs)
    // Intercepts file uploads before creating the song in the database
    .post(protect, upload.fields([
        { name: 'audio', maxCount: 1 }, 
        { name: 'image', maxCount: 1 }
    ]), createSong); 

router.route('/:id')
    .delete(protect, deleteSong);

export default router;