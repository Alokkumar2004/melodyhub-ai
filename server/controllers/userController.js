import User from '../models/User.js';

// @desc    Toggle like/unlike a song
// @route   POST /api/users/liked/:songId
export const toggleLikeSong = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized, please log in' });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { songId } = req.params;

        if (!user.likedSongs) {
            user.likedSongs = [];
        }

        // Convert ObjectIds to strings to avoid JavaScript strict equality false-negatives
        const songIndex = user.likedSongs.findIndex(id => id.toString() === songId.toString());
        let isLiked = false;

        if (songIndex > -1) {
            // Song is already liked -> Unlike (remove)
            user.likedSongs.splice(songIndex, 1);
            isLiked = false;
        } else {
            // Song not liked yet -> Like (add)
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

// @desc    Get user's liked songs
// @route   GET /api/users/liked
export const getLikedSongs = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // .populate('likedSongs') fetches full song documents referenced in the array
        const user = await User.findById(req.user._id).populate('likedSongs');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Mark isLiked: true on returned song objects for consistent UI hearts
        const songsWithLikedFlag = (user.likedSongs || []).map(song => {
            const songObj = song.toObject ? song.toObject() : { ...song };
            songObj.isLiked = true;
            return songObj;
        });

        res.status(200).json(songsWithLikedFlag);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile (Name & Email)
// @route   PUT /api/users/profile
export const updateUserProfile = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields if provided
        user.name = req.body.name?.trim() || user.name;
        user.email = req.body.email?.trim() || user.email;

        // If user provided a new password in the future:
        if (req.body.password && req.body.password.trim() !== '') {
            user.password = req.body.password;
        }

        const updatedUser = await user.save();

        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            likedSongs: updatedUser.likedSongs
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};