import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profileImage: { type: String, default: "" },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    likedSongs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }],
    playlists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Playlist' }],
    recentlyPlayed: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Song' }]
}, { timestamps: true }); // timestamps automatically adds createdAt and updatedAt

export default mongoose.model('User', userSchema);