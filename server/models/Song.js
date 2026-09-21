import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist' },
    album: { type: String },
    albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album' },
    coverImage: { type: String, required: true },
    audioUrl: { type: String, required: true },
    duration: { type: Number, required: true }, // duration in seconds
    genre: { type: String, required: true },
    playCount: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('Song', songSchema);