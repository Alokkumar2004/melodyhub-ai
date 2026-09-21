import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SongCard from '../components/SongCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Heart, ListMusic } from 'lucide-react';
import './Library.css';
import './Home.css';

const Library = () => {
  const [likedSongs, setLikedSongs] = useState([]);
  const [playlists, setPlaylists] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    const fetchLibraryData = async () => {
      if (!user) return; 
      try {
        const [likedRes, playlistsRes] = await Promise.all([
          api.get('/songs/liked'),
          api.get('/playlists') 
        ]);
        
        setLikedSongs(likedRes.data);
        setPlaylists(playlistsRes.data);
      } catch (error) {
        console.error("Error fetching library data", error);
      }
    };
    fetchLibraryData();
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
      
      <div className="library-top-bar">
        <h2 style={{ color: 'white', margin: 0 }}>Your Library</h2>
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
        
        {playlists.length > 0 && (
          <div style={{ marginBottom: '40px' }}>
            <h3 style={{ color: 'white', marginBottom: '20px' }}>Your Playlists</h3>
            <div className="cards-grid">
              {playlists.map((playlist) => (
                <div key={playlist._id} className="song-card">
                  <div className="song-image-container" style={{ backgroundColor: '#282828', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ListMusic size={48} color="#b3b3b3" />
                  </div>
                  <div className="song-text-info" style={{ width: '100%' }}>
                    <p className="card-title">{playlist.name}</p>
                    <p className="card-artist">By {user.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 style={{ color: 'white', marginBottom: '20px' }}>Liked Songs</h3>
        <div className="cards-grid">
          {likedSongs.length === 0 ? (
            <p style={{ color: '#b3b3b3' }}>You haven't liked any songs yet.</p>
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