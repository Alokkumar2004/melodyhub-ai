import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SongCard from '../components/SongCard';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home = () => {
  const [categories, setCategories] = useState({ popular: [], topArtists: [], allTimeHits: [] });
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchMusicData = async () => {
      try {
        // Fetch the 3 public categories
        const { data: catData } = await api.get('/songs/categories');
        setCategories(catData);

        // Fetch AI recommendations if user is logged in
        if (user) {
          const { data: recSongs } = await api.get('/songs/recommendations');
          setRecommendations(recSongs);
        }
      } catch (error) {
        console.error('Failed to fetch music data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusicData();
  }, [user]);

  // Helper to format URLs safely
  const formatSong = (s) => {
    if (!s) return null;
    const imageUrl = s.coverImage?.startsWith('http') ? s.coverImage : `http://localhost:5000${s.coverImage}`;
    const audioUrl = s.audioUrl?.startsWith('http') ? s.audioUrl : `http://localhost:5000${s.audioUrl}`;
    return { ...s, id: s._id, image: imageUrl, audioUrl: audioUrl };
  };

  const formatList = (list) => (list || []).map(formatSong);

  return (
    <div className="home-container">
      <Navbar />
      <div className="home-content">
        <h2 className="greeting">Welcome{user ? `, ${user.name}` : ''}</h2>
        
        {loading ? (
          <p style={{ color: '#a7a7a7' }}>Curating your AI playlists...</p>
        ) : (
          <>
            {/* 1. RECOMMENDED (AI/ML) */}
            {user && recommendations.length > 0 && (
              <div className="category-section">
                <h3 className="section-title">Recommended for You (AI Match)</h3>
                <div className="cards-row">
                  {formatList(recommendations).map((song) => (
                    <SongCard key={`rec-${song.id}`} song={song} playlist={formatList(recommendations)} />
                  ))}
                </div>
              </div>
            )}

            {/* 2. POPULAR TRACKS */}
            <div className="category-section">
              <h3 className="section-title">Popular Tracks</h3>
              <div className="cards-row">
                {formatList(categories.popular).map((song) => (
                  <SongCard key={`pop-${song.id}`} song={song} playlist={formatList(categories.popular)} />
                ))}
              </div>
            </div>

            {/* 3. TOP ARTISTS */}
            <div className="category-section">
              <h3 className="section-title">Top Artists Compilation</h3>
              <div className="cards-row">
                {formatList(categories.topArtists).map((song) => (
                  <SongCard key={`art-${song.id}`} song={song} playlist={formatList(categories.topArtists)} />
                ))}
              </div>
            </div>

            {/* 4. ALL TIME HITS */}
            <div className="category-section">
              <h3 className="section-title">All-Time Hits</h3>
              <div className="cards-row">
                {formatList(categories.allTimeHits).map((song) => (
                  <SongCard key={`hit-${song.id}`} song={song} playlist={formatList(categories.allTimeHits)} />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Home;