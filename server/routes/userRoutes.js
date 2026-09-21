import express from 'express';
import { 
    toggleLikeSong, 
    getLikedSongs, 
    updateUserProfile 
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Profile Routes
router.put('/profile', protect, updateUserProfile);

// Liked Songs Routes
router.post('/liked/:songId', protect, toggleLikeSong);
router.get('/liked', protect, getLikedSongs);

export default router;