import React, { useState } from 'react';
import { Home, Search, Library, User, ListPlus, Check, Wand2, Loader } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import './MobileNav.css';

const MobileNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [playlistName, setPlaylistName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false); // Tracks if AI is loading

  // --- The AI Generation Function with Explicit Token Header ---
  const handleGenerateAIName = async () => {
    setIsGenerating(true);
    setPlaylistName('Thinking...'); // Visual feedback for the user
    
    try {
      // Pull token explicitly so mobile session auth doesn't drop
      const token = localStorage.getItem('token');
      
      const { data } = await api.get('/playlists/magic-name', {
        headers: {
          Authorization: token ? `Bearer ${token}` : undefined
        }
      }); 
      
      // Update the input box with the AI's suggestion
      setPlaylistName(data.name || data.suggestion || "My AI Playlist");
    } catch (error) {
      console.error("AI Naming error:", error.response?.data || error.message);
      setPlaylistName("Cool Vibes"); // Fallback if it fails
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
      {/* The Floating Desktop-Style Creation Box */}
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
              disabled={isGenerating} // Lock input while AI is thinking
            />
            
            {/* Wand Button optimized for mobile touch interaction */}
            <button 
              type="button"
              onPointerDown={(e) => {
                e.preventDefault();
                if (!isGenerating) {
                  handleGenerateAIName();
                }
              }}
              disabled={isGenerating}
              style={{ 
                background: 'transparent', 
                border: 'none', 
                cursor: 'pointer', 
                padding: 0, 
                display: 'flex',
                touchAction: 'manipulation' 
              }}
            >
              {isGenerating ? (
                <Loader size={14} color="#a7a7a7" className="spin-animation" />
              ) : (
                <Wand2 size={14} color="#facc15" />
              )}
            </button>
          </div>
          
          {/* Submit Checkmark Button optimized for mobile touch interaction */}
          <button 
            type="button"
            className="inline-submit-btn" 
            onPointerDown={(e) => {
              e.preventDefault();
              if (!isGenerating) {
                handleCreateSubmit();
              }
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

        {/* Create Playlist Nav Button */}
        <button 
          type="button"
          className={`mobile-nav-item ${isCreating ? 'active' : ''}`} 
          onClick={() => setIsCreating(!isCreating)}
          style={{ background: 'transparent', border: 'none', cursor: 'pointer', outline: 'none' }}
        >
          <ListPlus size={24} />
          <span>Create</span>
        </button>
        
        <Link to="/library" className={`mobile-nav-item ${location.pathname === '/library' ? 'active' : ''}`}>
          <Library size={24} />
          <span>Library</span>
        </Link>

        <Link to="/profile" className={`mobile-nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
          <User size={24} />
          <span>Profile</span>
        </Link>
      </div>
    </>
  );
};

export default MobileNav;