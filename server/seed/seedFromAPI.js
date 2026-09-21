import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from '../config/db.js';
import Song from '../models/Song.js';

dotenv.config();

// Multiple search queries to pull a rich variety of 200+ tracks from the iTunes API
const searchQueries = [
    'arijit+singh', 
    'bollywood+romantic', 
    'party+hits', 
    'sad+hindi', 
    'classic+bollywood', 
    'dance+tracks', 
    'punjabi+hits', 
    'acoustic+songs',
    'happy+hits'
];

// Your exact search page category pills
const genresPool = ['Romantic', 'Sad', 'Happy', 'Bollywood', 'Classic', 'Dance', 'Party', 'Wedding', 'Travel'];

const seedFromAPI = async () => {
    try {
        await connectDB();
        console.log('Connecting to iTunes API to fetch 200+ songs...');
        
        let collectedSongs = [];

        // Loop through search queries to aggregate 200+ unique tracks
        for (const query of searchQueries) {
            try {
                const response = await fetch(`https://itunes.apple.com/search?term=${query}&entity=song&limit=30`);
                const data = await response.json();

                if (data.results) {
                    const tracks = data.results
                        .filter(track => track.previewUrl && track.trackName)
                        .map((track, index) => ({
                            title: track.trackName,
                            artist: track.artistName,
                            coverImage: track.artworkUrl100 ? track.artworkUrl100.replace('100x100bb', '600x600bb') : 'https://via.placeholder.com/600',
                            audioUrl: track.previewUrl,
                            duration: track.trackTimeMillis ? Math.floor(track.trackTimeMillis / 1000) : 180,
                            // Distribute tracks evenly across your 9 search genre categories
                            genre: genresPool[(collectedSongs.length + index) % genresPool.length],
                            playCount: Math.floor(Math.random() * 1000000)
                        }));

                    collectedSongs = [...collectedSongs, ...tracks];
                }
            } catch (err) {
                console.warn(`Warning: Failed fetching for query ${query}`, err.message);
            }
        }

        // Deduplicate tracks by title and artist combination
        const uniqueSongs = Array.from(
            new Map(collectedSongs.map(song => [`${song.title}-${song.artist}`, song])).values()
        );

        // Clear existing database and insert fresh API data
        await Song.deleteMany();
        console.log('Old songs cleared from database.');

        await Song.insertMany(uniqueSongs);
        console.log(`Success! Inserted ${uniqueSongs.length} real songs from API across all categories!`);
        
        process.exit();
    } catch (error) {
        console.error(`Seeder Error: ${error.message}`);
        process.exit(1);
    }
};

seedFromAPI();