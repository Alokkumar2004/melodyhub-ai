import mongoose from 'mongoose';

const albumSchema = new mongoose.Schema({
    title: { type: String, required: true },
    artist: { type: String, required: true },
    artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
    coverImage: { type: String, required: true },
    releaseYear: { type: Number, required: true },
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
}, { timestamps: true });

export default mongoose.model('Album', albumSchema);