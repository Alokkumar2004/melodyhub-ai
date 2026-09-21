import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, Search, Library, Heart, LayoutDashboard, Disc, Plus, Check, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import './Sidebar.css';

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  
  // State for real-time liked songs count
  const [likedCount, setLikedCount] = useState(0);

  // Helper to instantly update count from localStorage
  const updateLikedCount = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.likedSongs) {
        setLikedCount(userInfo.likedSongs.length);
      } else {
        setLikedCount(0);
      }
    } catch (e) {
      console.error("Error reading liked songs for sidebar", e);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPlaylists();
      updateLikedCount();
    } else {
      setPlaylists([]);
      setLikedCount(0);
    }

    const handlePlaylistDeleted = (e) => {
      const deletedId = e.detail;
      setPlaylists((prev) => prev.filter(p => p._id !== deletedId));
    };

    const handlePlaylistRenamed = (e) => {
      const updatedPlaylist = e.detail;
      setPlaylists((prev) => 
        prev.map(p => p._id === updatedPlaylist._id ? { ...p, name: updatedPlaylist.name } : p)
      );
    };

    // Listeners for playlists
    window.addEventListener('playlistDeleted', handlePlaylistDeleted);
    window.addEventListener('playlistRenamed', handlePlaylistRenamed);
    
    // Listeners for instant liked songs updates
    window.addEventListener('likedSongsUpdated', updateLikedCount);
    window.addEventListener('storage', updateLikedCount); // catches updates from other tabs

    return () => {
      window.removeEventListener('playlistDeleted', handlePlaylistDeleted);
      window.removeEventListener('playlistRenamed', handlePlaylistRenamed);
      window.removeEventListener('likedSongsUpdated', updateLikedCount);
      window.removeEventListener('storage', updateLikedCount);
    };
  }, [user]);

  const fetchPlaylists = async () => {
    try {
      const { data } = await api.get('/playlists');
      setPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists", error);
    }
  };

  const handleSaveNewPlaylist = async (e) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const { data } = await api.post('/playlists', { name: newPlaylistName.trim() });
      setPlaylists([...playlists, data]);
      setNewPlaylistName('');
      setIsCreating(false);
      navigate(`/playlist/${data._id}`);
    } catch (error) {
      console.error("Error creating playlist", error);
      alert("Failed to create playlist.");
    }
  };

  // ✨ NEW: AI Magic Namer Function
  const generateMagicName = async (e) => {
    e.preventDefault();
    setNewPlaylistName('✨ Thinking...');
    try {
      const { data } = await api.get('/ai/magic-name');
      setNewPlaylistName(data.name);
    } catch (error) {
      setNewPlaylistName('Cool Playlist');
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <h2>MelodyHub</h2>
      </div>

      <div className="sidebar-menu">
        <Link to="/" className="sidebar-link"><Home size={24} /><span>Home</span></Link>
        <Link to="/search" className="sidebar-link"><Search size={24} /><span>Search</span></Link>
        <Link to="/library" className="sidebar-link"><Library size={24} /><span>Your Library</span></Link>
      </div>

      <div className="sidebar-menu">
        <button className="sidebar-btn" onClick={() => setIsExpanded(!isExpanded)}>
          <Disc size={24} /><span>Playlists</span>
        </button>
        
        {/* Dynamic Liked Songs Link */}
        <Link to="/liked" className="sidebar-link">
          <Heart size={24} color={likedCount > 0 ? "#1db954" : "currentColor"} />
          <span>Liked Songs {likedCount > 0 && `(${likedCount})`}</span>
        </Link>
        
        {user?.role === 'admin' && (
          <Link to="/admin" className="sidebar-link"><LayoutDashboard size={24} /><span>Dashboard</span></Link>
        )}
      </div>

      <hr className="sidebar-divider" />

      {isExpanded && (
        <div className="sidebar-playlists-container">
          {!isCreating ? (
            <button className="create-inline-btn" onClick={() => setIsCreating(true)}>
              <Plus size={16} /><span>New Playlist</span>
            </button>
          ) : (
            <form onSubmit={handleSaveNewPlaylist} className="inline-create-form">
              {/* ✨ NEW: AI Input Wrapper */}
              <div style={{ display: 'flex', width: '100%', gap: '4px', alignItems: 'center' }}>
                <input 
                  type="text" placeholder="Playlist name..."
                  value={newPlaylistName} onChange={(e) => setNewPlaylistName(e.target.value)}
                  autoFocus className="inline-input"
                  style={{ flex: 1 }}
                />
                
                {/* ✨ Magic Wand Button */}
                <button 
                  type="button" 
                  onClick={generateMagicName} 
                  title="Generate AI Name"
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '18px', padding: '0 4px' }}
                >
                  ✨
                </button>
              </div>

              <div className="inline-form-actions">
                <button type="submit" className="inline-action-btn save"><Check size={14} /></button>
                <button type="button" className="inline-action-btn cancel" onClick={() => { setIsCreating(false); setNewPlaylistName(''); }}><X size={14} /></button>
              </div>
            </form>
          )}

          <div className="sidebar-playlists">
            {playlists.length === 0 && user ? (
              <p className="no-playlists-text">No playlists yet.</p>
            ) : (
              playlists.map((playlist) => (
                <Link key={playlist._id} to={`/playlist/${playlist._id}`} className="playlist-item">
                  <Disc size={14} /><span>{playlist.name}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;