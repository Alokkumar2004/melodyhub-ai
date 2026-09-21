import express from 'express';
import { 
    createPlaylist, getUserPlaylists, getSinglePlaylist, 
    updatePlaylist, addSongToPlaylist, deletePlaylist, removeSongFromPlaylist 
} from '../controllers/playlistController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
router.route('/').post(protect, createPlaylist).get(protect, getUserPlaylists);
router.route('/:id').get(protect, getSinglePlaylist).put(protect, updatePlaylist).delete(protect, deletePlaylist);
router.route('/:id/add').post(protect, addSongToPlaylist);
router.route('/:id/songs/:songId').delete(protect, removeSongFromPlaylist);

export default router;