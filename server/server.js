import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import morgan from 'morgan';
import path from 'path';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import songRoutes from './routes/songRoutes.js';
import userRoutes from './routes/userRoutes.js';
import playlistRoutes from './routes/playlistRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

dotenv.config();
connectDB();

const app = express();

// Middleware
// Find your cors setup and change it to look like this:

app.use(cors({
    origin: [
        'http://localhost:3000', 
        'http://localhost:5173',          // <-- Add this new Vite local port
        'https://melodyhub-ai.vercel.app' // Your live Vercel site
    ],
    credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Serve the 'uploads' folder as static files so the frontend can access images and audio
const __dirname = path.resolve();
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/users', userRoutes);
app.use('/api/playlists', playlistRoutes);
app.use('/api/ai', aiRoutes);
// Base API route
app.get('/api', (req, res) => {
    res.status(200).json({ success: true, message: 'Welcome to the MelodyHub API!' });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});