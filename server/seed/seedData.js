import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Song from '../models/Song.js';

// Load environment variables so we can access MONGO_URI
dotenv.config();

const seedSongs = [
    {
        title: 'Pehla Nasha',
        artist: 'Udit Narayan, Sadhana Sargam',
        coverImage: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=300&q=80',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
        duration: 293,
        genre: 'Bollywood'
    },
    {
        title: 'Deep Synth Wave',
        artist: 'Electro Beats',
        coverImage: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&q=80',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
        duration: 345,
        genre: 'Electronic'
    },
    {
        title: 'Ambient Chillout',
        artist: 'LoFi Dreamer',
        coverImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300&q=80',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
        duration: 250,
        genre: 'Lo-Fi'
    },
    {
        title: 'Urban Rhythm',
        artist: 'Metro Pulse',
        coverImage: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&q=80',
        audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
        duration: 310,
        genre: 'Pop'
    }
];

const importData = async () => {
    try {
        await connectDB();

        // Clear existing songs to prevent duplicates
        await Song.deleteMany();
        console.log('Existing songs cleared...');

        // Insert the new songs
        await Song.insertMany(seedSongs);
        console.log('Database successfully seeded with tracks!');

        process.exit();
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

importData();