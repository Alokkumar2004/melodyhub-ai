import Playlist from '../models/Playlist.js';

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