import React, { useState, useEffect } from 'react';
import { Home, Search, Library, User, ListPlus, Check, Wand2, Loader, Music, Trash2, X } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MobileNav.css';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Playlists Drawer States
  const [showPlaylistsDrawer, setShowPlaylistsDrawer] = useState(false);
  const [userPlaylists, setUserPlaylists] = useState([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);

  // --- NEW: Custom UI Delete Confirmation State ---
  const [playlistToDelete, setPlaylistToDelete] = useState(null);

  const fetchUserPlaylists = async () => {
    setLoadingPlaylists(true);
    try {
      const { data } = await api.get('/playlists');
      setUserPlaylists(data);
    } catch (error) {
      console.error("Error fetching playlists for mobile view:", error);
    } finally {
      setLoadingPlaylists(false);
    }
  };

  const handleOpenPlaylists = () => {
    setIsCreating(false);
    setShowPlaylistsDrawer(true);
    setSelectedPlaylist(null);
    setPlaylistToDelete(null);
    fetchUserPlaylists();
  };

  // Custom UI Delete Trigger (opens custom prompt instead of window.confirm)
  const confirmDeletePlaylist = (playlist, e) => {
    e.stopPropagation();
    setPlaylistToDelete(playlist);
  };

  // Actual Delete Execution
  const handleDeletePlaylist = async () => {
    if (!playlistToDelete) return;
    try {
      await api.delete(`/playlists/${playlistToDelete._id}`);
      setUserPlaylists(userPlaylists.filter(p => p._id !== playlistToDelete._id));
      if (selectedPlaylist?._id === playlistToDelete._id) {
        setSelectedPlaylist(null);
      }
      setPlaylistToDelete(null);
    } catch (error) {
      console.error("Error deleting playlist:", error);
      alert("Failed to delete playlist.");
    }
  };

  const handleRemoveSong = async (playlistId, songId, e) => {
    e.stopPropagation();
    try {
      const { data } = await api.delete(`/playlists/${playlistId}/songs/${songId}`);
      setSelectedPlaylist(data);
      setUserPlaylists(userPlaylists.map(p => p._id === playlistId ? data : p));
    } catch (error) {
      console.error("Error removing song:", error);
      alert("Failed to remove song.");
    }
  };

  const handleGenerateAIName = async () => {
    setIsGenerating(true);
    setPlaylistName('Thinking...'); 
    
    try {
      const token = localStorage.getItem('token');
      const { data } = await api.get('/playlists/magic-name', {
        headers: { Authorization: token ? `Bearer ${token}` : undefined }
      }); 
      setPlaylistName(data.name || data.suggestion || "My AI Playlist");
    } catch (error) {
      console.error("AI Naming error:", error.response?.data || error.message);
      setPlaylistName("Cool Vibes"); 
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateSubmit = async () => {
    if (!playlistName.trim() || playlistName === 'Thinking...') {
      setIsCreating(false);
      return;
    }

    try {
      await api.post('/playlists', { name: playlistName });
      setPlaylistName('');
      setIsCreating(false);
      if (location.pathname === '/library') {
        window.location.reload();
      } else {
        navigate('/library');
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert("Failed to create playlist.");
    }
  };

  return (
    <>
      {/* Playlist Manager Drawer */}
      {showPlaylistsDrawer && (
        <div className="mobile-playlists-modal-overlay" onClick={() => setShowPlaylistsDrawer(false)}>
          <div className="mobile-playlists-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedPlaylist ? selectedPlaylist.name : 'Your Playlists'}</h3>
              <button className="close-modal-btn" onClick={() => setShowPlaylistsDrawer(false)}>
                <X size={20} color="white" />
              </button>
            </div>

            <div className="modal-body">
              {/* --- CUSTOM UI DELETE CONFIRMATION OVERLAY --- */}
              {playlistToDelete ? (
                <div className="custom-confirm-box">
                  <p>Delete "{playlistToDelete.name}"?</p>
                  <span>This action cannot be undone.</span>
                  <div className="confirm-actions">
                    <button className="cancel-btn" onClick={() => setPlaylistToDelete(null)}>Cancel</button>
                    <button className="delete-btn" onClick={handleDeletePlaylist}>Delete</button>
                  </div>
                </div>
              ) : selectedPlaylist ? (
                <div>
                  <button className="back-to-list-btn" onClick={() => setSelectedPlaylist(null)}>
                    ← Back to all playlists
                  </button>
                  <p className="playlist-owner-info">Songs ({selectedPlaylist.songs?.length || 0})</p>
                  
                  {(!selectedPlaylist.songs || selectedPlaylist.songs.length === 0) ? (
                    <p className="empty-text">No songs added to this playlist yet.</p>
                  ) : (
                    <div className="modal-songs-list">
                      {selectedPlaylist.songs.map((song) => (
                        <div key={song._id || song.id} className="modal-song-item">
                          <img src={song.coverImage || song.image} alt={song.title} className="modal-song-thumb" />
                          <div className="modal-song-details">
                            <span className="modal-song-title">{song.title}</span>
                            <span className="modal-song-artist">{song.artist}</span>
                          </div>
                          <button 
                            className="modal-remove-song-btn" 
                            onClick={(e) => handleRemoveSong(selectedPlaylist._id, song._id || song.id, e)}
                          >
                            <Trash2 size={16} color="#ef4444" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  {loadingPlaylists ? (
                    <div className="modal-loader"><Loader size={24} className="spin-animation" color="#facc15" /></div>
                  ) : userPlaylists.length === 0 ? (
                    <p className="empty-text">No playlists created yet. Use the Create button & Magic Wand!</p>
                  ) : (
                    <div className="modal-playlists-list">
                      {userPlaylists.map((playlist) => (
                        <div 
                          key={playlist._id} 
                          className="modal-playlist-card"
                          onClick={() => setSelectedPlaylist(playlist)}
                        >
                          <div className="modal-playlist-info">
                            <Music size={20} color="#facc15" />
                            <div>
                              <h4>{playlist.name}</h4>
                              <span>{playlist.songs?.length || 0} songs</span>
                            </div>
                          </div>
                          <button 
                            className="modal-delete-playlist-btn"
                            onClick={(e) => confirmDeletePlaylist(playlist, e)}
                          >
                            <Trash2 size={18} color="#ef4444" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floating Creation Box */}
      {isCreating && (
        <div className="mobile-create-popup">
          <div className="inline-input-wrapper">
            <input
              type="text"
              placeholder="Playlist name..."
              value={playlistName}
              onChange={(e) => setPlaylistName(e.target.value)}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateSubmit()}
              disabled={isGenerating}
            />
            <button 
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                if (!isGenerating) handleGenerateAIName();
              }}
              disabled={isGenerating}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', touchAction: 'manipulation' }}
            >
              {isGenerating ? <Loader size={14} color="#a7a7a7" className="spin-animation" /> : <Wand2 size={14} color="#facc15" />}
            </button>
          </div>
          <button 
            type="button"
            className="inline-submit-btn" 
            onPointerDown={(e) => {
              e.preventDefault();
              if (!isGenerating) handleCreateSubmit();
            }} 
            disabled={isGenerating}
          >
            <Check size={16} color="white" />
          </button>
        </div>
      )}

      {/* Bottom Navigation Bar */}
      <div className="mobile-nav">
        <Link to="/" className={`mobile-nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <Home size={24} />
          <span>Home</span>
        </Link>
        <Link to="/search" className={`mobile-nav-item ${location.pathname === '/search' ? 'active' : ''}`}>
          <Search size={24} />
          <span>Search</span>
        </Link>
        <button 
          type="button"
          className={`mobile-nav-item ${isCreating ? 'active' : ''}`} 
          onClick={() => { setIsCreating(!isCreating); setShowPlaylistsDrawer(false); }}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}
        >
          <ListPlus size={24} />
          <span>Create</span>
        </button>
        <button 
          type="button"
          className={`mobile-nav-item ${showPlaylistsDrawer ? 'active' : ''}`} 
          onClick={handleOpenPlaylists}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}
        >
          <Music size={24} />
          <span>Playlists</span>
        </button>
        <Link to="/library" className={`mobile-nav-item ${location.pathname === '/library' ? 'active' : ''}`}>
          <Library size={24} />
          <span>Library</span>
        </Link>
      </div>
    </>
  );
};

export default MobileNav;