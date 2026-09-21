import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SongCard from '../components/SongCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Heart, Plus } from 'lucide-react'; // <-- Imported Plus icon
import './Library.css';
import './Home.css';

const Library = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLikedSongs = async () => {
      if (!user) return; // Wait until user is logged in
      try {
        // FIXED: Updated to match your backend songRoutes.js endpoint
        const { data } = await api.get('/songs/liked');
        setLikedSongs(data);
      } catch (error) {
        console.error("Error fetching liked songs", error);
      }
    };
    fetchLikedSongs();
  }, [user]);

  if (!user) {
    return (
      <div className="library-container">
        <Navbar />
        <div className="library-content">
          <h2 style={{ textAlign: 'center', marginTop: '40px', color: '#b3b3b3' }}>
            Log in to view your Library
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="library-container">
      <Navbar />
      
      {/* NEW: Top Action Bar for Library (Crucial for Mobile Users) */}
      <div className="library-top-bar">
        <h2 style={{ color: 'white', margin: 0 }}>Your Library</h2>
        <button className="create-playlist-btn" onClick={() => alert('AI Magic Namer coming soon!')}>
          <Plus size={20} />
          <span>Create Playlist</span>
        </button>
      </div>

      <div className="library-header">
        <div className="liked-icon-container">
          <Heart size={64} color="#ffffff" fill="#ffffff" />
        </div>
        <div className="library-header-info">
          <span className="profile-type">Playlist</span>
          <h1 className="profile-title">Liked Songs</h1>
          <span className="profile-stats">{user.name} • {likedSongs.length} songs</span>
        </div>
      </div>
      
      <div className="library-content">
        <div className="cards-grid">
          {likedSongs.length === 0 ? (
            <p style={{ color: '#b3b3b3' }}>You haven't liked any songs yet. Go find some music!</p>
          ) : (
            likedSongs.map((song) => (
              <SongCard 
                key={song._id} 
                song={{ ...song, id: song._id, image: song.coverImage }} 
                playlist={likedSongs.map(s => ({ ...s, id: s._id, image: s.coverImage }))} 
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;