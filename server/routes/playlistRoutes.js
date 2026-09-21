import express from 'express';
import { 
    generateMagicName, 
    createPlaylist, 
    getUserPlaylists, 
    getSinglePlaylist, 
    updatePlaylist, 
    addSongToPlaylist, 
    deletePlaylist, 
    removeSongFromPlaylist 
} from '../controllers/playlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- AI MAGIC ROUTE ---
// Must go BEFORE /:id routes so Express doesn't treat 'magic-name' as a database ID
router.get('/magic-name', protect, generateMagicName);

// --- STANDARD PLAYLIST ROUTES ---
router.route('/')
    .post(protect, createPlaylist)
    .get(protect, getUserPlaylists);

router.route('/:id')
    .get(protect, getSinglePlaylist)
    .put(protect, updatePlaylist)
    .delete(protect, deletePlaylist);

router.route('/:id/add')
    .post(protect, addSongToPlaylist);

router.route('/:id/songs/:songId')
    .delete(protect, removeSongFromPlaylist);

export default router;