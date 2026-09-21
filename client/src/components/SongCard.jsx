import React, { useState, useEffect, useRef } from 'react';
import { MoreVertical, Check, Music, Heart } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import api from '../services/api';
import './SongCard.css';

const SongCard = ({ song, playlist = [] }) => {
  const { playSong } = useMusicPlayer();
  const [showMenu, setShowMenu] = useState(false);
  const [playlists, setPlaylists] = useState([]);
  const [addedMessage, setAddedMessage] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const menuRef = useRef(null);

  const songId = song._id || song.id;

  // Direct check against localStorage likedSongs for real-time persistence across navigation
  const checkIsLiked = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      if (userInfo && userInfo.likedSongs) {
        return userInfo.likedSongs.some(
          id => id === songId || (id && id.toString() === songId?.toString())
        );
      }
    } catch (e) {
      // fallback
    }
    return Boolean(song.isLiked);
  };

  const [isLiked, setIsLiked] = useState(checkIsLiked);

  // Re-check whenever songId changes or global storage events fire
  useEffect(() => {
    setIsLiked(checkIsLiked());

    const handleSync = () => setIsLiked(checkIsLiked());
    window.addEventListener('storage', handleSync);
    window.addEventListener('likedSongsUpdated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('likedSongsUpdated', handleSync);
    };
  }, [songId]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuToggle = async (e) => {
    e.stopPropagation();
    if (!showMenu) {
      try {
        const { data } = await api.get('/playlists');
        setPlaylists(data);
      } catch (error) {
        console.error("Error fetching playlists for dropdown", error);
      }
    }
    setShowMenu(!showMenu);
  };

  const handleAddToPlaylist = async (e, playlistId, playlistName) => {
    e.stopPropagation();
    try {
      await api.post(`/playlists/${playlistId}/add`, { songId });
      setAddedMessage(`Added to ${playlistName}!`);
      setTimeout(() => {
        setAddedMessage('');
        setShowMenu(false);
      }, 1500);
    } catch (error) {
      alert(error.response?.data?.message || "Failed to add song to playlist");
    }
  };

  const handleLikeToggle = async (e) => {
    e.stopPropagation();
    
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 300);

    const previousState = isLiked;
    const newState = !previousState;
    setIsLiked(newState); // Instant optimistic update

    try {
      const { data } = await api.post(`/songs/like`, { songId });
      
      if (data && data.likedSongs) {
        setIsLiked(data.isLiked);
        
        // Update user info in localStorage and trigger global sync event
        const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
        userInfo.likedSongs = data.likedSongs;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        window.dispatchEvent(new Event('likedSongsUpdated'));
      }
    } catch (error) {
      console.error("Failed to update like status", error);
      setIsLiked(previousState); // Revert if request fails
    }
  };

  const handleCardClick = () => {
    const activePlaylist = playlist.length > 0 ? playlist : [song];
    playSong(song, activePlaylist);
  };

  const imageUrl = song.coverImage || song.image;
  const formattedImage = imageUrl && imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;

  return (
    <div className="song-card" onClick={handleCardClick}>
      <div className="song-image-container">
        <img src={formattedImage} alt={song.title} className="song-image" loading="lazy" />
      </div>

      <div className="song-card-content">
        <div className="song-text-info">
          <div className="card-title">{song.title}</div>
          <div className="card-artist">{song.artist}</div>
        </div>

        <div className="song-card-actions" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
          <button 
            className={`stylish-like-btn ${isLiked ? 'liked' : ''} ${isAnimating ? 'animate-pop' : ''}`}
            onClick={handleLikeToggle} 
            title={isLiked ? "Unlike song" : "Like song"}
          >
            <Heart size={18} className="heart-icon" />
          </button>

          <div className="song-menu-wrapper" ref={menuRef}>
            <button className="song-menu-btn" onClick={handleMenuToggle} title="Add to playlist">
              <MoreVertical size={16} color="#b3b3b3" />
            </button>

            {showMenu && (
              <div className="playlist-dropdown" onClick={(e) => e.stopPropagation()}>
                <div className="dropdown-header">Add to playlist</div>
                <div className="dropdown-divider"></div>
                
                {addedMessage ? (
                  <div className="dropdown-success">
                    <Check size={14} color="#1db954" /> <span>{addedMessage}</span>
                  </div>
                ) : playlists.length === 0 ? (
                  <div className="dropdown-empty">No playlists found. Create one in the sidebar!</div>
                ) : (
                  <div className="dropdown-list">
                    {playlists.map((playlistItem) => (
                      <button 
                        key={playlistItem._id} 
                        className="dropdown-item"
                        onClick={(e) => handleAddToPlaylist(e, playlistItem._id, playlistItem.name)}
                      >
                        <Music size={14} color="#b3b3b3" />
                        <span>{playlistItem.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SongCard;