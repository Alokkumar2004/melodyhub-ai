import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Music, Clock, Trash2, Edit2, Check, X, AlertTriangle } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import api from '../services/api';
import './PlaylistView.css';

const PlaylistView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { playSong } = useMusicPlayer();
  const [playlist, setPlaylist] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isRenaming, setIsRenaming] = useState(false);
  const [newName, setNewName] = useState('');
  const [showDeletePlaylistModal, setShowDeletePlaylistModal] = useState(false);
  const [songToRemove, setSongToRemove] = useState(null);

  useEffect(() => {
    fetchPlaylistDetails();
  }, [id]);

  const fetchPlaylistDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/playlists/${id}`);
      setPlaylist(data);
      setNewName(data.name);
    } catch (error) {
      console.error("Error fetching playlist details", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRename = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;

    try {
      const { data } = await api.put(`/playlists/${id}`, { name: newName.trim() });
      setPlaylist(data);
      setIsRenaming(false);
      window.dispatchEvent(new CustomEvent('playlistRenamed', { detail: data }));
    } catch (error) {
      console.error("Error renaming playlist", error);
      alert("Failed to rename playlist.");
    }
  };

  const confirmDeletePlaylist = async () => {
    try {
      await api.delete(`/playlists/${id}`);
      window.dispatchEvent(new CustomEvent('playlistDeleted', { detail: id }));
      navigate('/');
    } catch (error) {
      console.error("Error deleting playlist", error);
      alert("Failed to delete playlist.");
    }
  };

  const confirmRemoveSong = async () => {
    if (!songToRemove) return;
    try {
      const { data } = await api.delete(`/playlists/${id}/songs/${songToRemove._id}`);
      setPlaylist(data);
      setSongToRemove(null);
    } catch (error) {
      console.error("Error removing song from playlist", error);
      alert("Failed to remove song.");
    }
  };

  if (loading) return <div className="playlist-loading">Loading playlist...</div>;
  if (!playlist) return <div className="playlist-loading">Playlist not found.</div>;

  return (
    <div className="playlist-view">
      <div className="playlist-header">
        <div className="playlist-cover-placeholder"><Music size={64} color="#b3b3b3" /></div>
        <div className="playlist-header-info">
          <span className="playlist-type">Playlist</span>

          {!isRenaming ? (
            <div className="playlist-title-row">
              <h1>{playlist.name}</h1>
              <button className="rename-toggle-btn" onClick={() => { setIsRenaming(true); setNewName(playlist.name); }}><Edit2 size={18} /></button>
            </div>
          ) : (
            <form onSubmit={handleSaveRename} className="inline-rename-form">
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} autoFocus className="rename-input" />
              <button type="submit" className="rename-action-btn save"><Check size={16} /></button>
              <button type="button" className="rename-action-btn cancel" onClick={() => setIsRenaming(false)}><X size={16} /></button>
            </form>
          )}

          <p className="playlist-desc">{playlist.description || "Your custom collection."}</p>
          <div className="playlist-meta"><span>{playlist.songs.length} songs</span></div>
        </div>
      </div>

      <div className="playlist-actions-row">
        {playlist.songs.length > 0 && (
          <button className="play-all-btn" onClick={() => playSong(playlist.songs[0], playlist.songs)}>
            <Play size={22} fill="black" color="black" />
          </button>
        )}
        <button className="delete-playlist-btn" onClick={() => setShowDeletePlaylistModal(true)}>
          <Trash2 size={18} /><span>Delete Playlist</span>
        </button>
      </div>

      <div className="playlist-songs-container">
        <div className="song-table-header">
          <div className="col-num">#</div>
          <div className="col-title">Title</div>
          <div className="col-duration"><Clock size={16} /></div>
          <div className="col-action"></div>
        </div>
        <div className="divider-line"></div>

        {playlist.songs.length === 0 ? (
          <div className="empty-playlist-msg"><p>This playlist is empty.</p></div>
        ) : (
          playlist.songs.map((song, index) => {
            const imageUrl = song.coverImage || song.image;
            const formattedImage = imageUrl && imageUrl.startsWith('http') ? imageUrl : `http://localhost:5000${imageUrl}`;
            return (
              <div key={song._id || index} className="song-table-row" onClick={() => playSong(song, playlist.songs)}>
                <div className="col-num">{index + 1}</div>
                <div className="col-title">
                  <img src={formattedImage} alt={song.title} className="row-song-img" />
                  <div className="row-song-text"><span className="row-title">{song.title}</span><span className="row-artist">{song.artist}</span></div>
                </div>
                <div className="col-duration">3:45</div>
                <div className="col-action">
                  <button className="remove-song-btn" onClick={(e) => { e.stopPropagation(); setSongToRemove(song); }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {showDeletePlaylistModal && (
        <div className="modal-overlay" onClick={() => setShowDeletePlaylistModal(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper"><AlertTriangle size={28} color="#ff4d4d" /></div>
            <h3>Delete Playlist</h3>
            <p>Delete <strong>"{playlist.name}"</strong>?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setShowDeletePlaylistModal(false)}>Cancel</button>
              <button className="modal-btn confirm-danger" onClick={confirmDeletePlaylist}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {songToRemove && (
        <div className="modal-overlay" onClick={() => setSongToRemove(null)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon-wrapper"><AlertTriangle size={28} color="#ff4d4d" /></div>
            <h3>Remove Song</h3>
            <p>Remove <strong>"{songToRemove.title}"</strong>?</p>
            <div className="modal-actions">
              <button className="modal-btn cancel" onClick={() => setSongToRemove(null)}>Cancel</button>
              <button className="modal-btn confirm-danger" onClick={confirmRemoveSong}>Remove</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlaylistView;