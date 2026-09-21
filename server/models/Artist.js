import mongoose from 'mongoose';

const artistSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    bio: { type: String, default: "" },
    followers: { type: Number, default: 0 },
    albums: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Album' }],
    songs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
}, { timestamps: true });

export default mongoose.model('Artist', artistSchema);