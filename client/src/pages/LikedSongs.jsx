import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import api from '../services/api';
import SongCard from '../components/SongCard';
import './LikedSongs.css';

const LikedSongs = () => {
  const [songs, setSongs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLikedSongs = async () => {
    try {
      const { data } = await api.get('/songs/liked');
      setSongs(data);
    } catch (error) {
      console.error("Error fetching liked songs", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLikedSongs();
    
    // Listen for changes so if you unlike a song here, it instantly disappears!
    window.addEventListener('likedSongsUpdated', fetchLikedSongs);
    return () => window.removeEventListener('likedSongsUpdated', fetchLikedSongs);
  }, []);

  if (loading) {
    return (
      <div className="liked-songs-page">
        <div className="loading-state">Loading your favorite tracks...</div>
      </div>
    );
  }

  return (
    <div className="liked-songs-page">
      <div className="liked-header">
        <div className="liked-icon-container">
          <Heart size={48} color="#fff" fill="#fff" />
        </div>
        <div className="liked-header-info">
          <span>Playlist</span>
          <h1>Liked Songs</h1>
          <p>{songs.length} {songs.length === 1 ? 'song' : 'songs'}</p>
        </div>
      </div>
      
      {songs.length === 0 ? (
        <div className="empty-liked-state">
          <Heart size={64} color="#333" />
          <h2>Songs you like will appear here</h2>
          <p>Save songs by tapping the heart icon.</p>
        </div>
      ) : (
        <div className="liked-songs-grid">
          {songs.map((song) => (
            <SongCard key={song._id} song={song} playlist={songs} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedSongs;