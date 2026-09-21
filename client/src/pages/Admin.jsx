import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

const Admin = () => {
  const [songs, setSongs] = useState([]);
  const { user } = useAuth();
  
  // Form State
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const { data } = await api.get('/songs');
      setSongs(data);
    } catch (error) {
      console.error("Failed to fetch songs", error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this song?")) {
      try {
        await api.delete(`/songs/${id}`);
        setSongs(songs.filter(song => song._id !== id));
      } catch (error) {
        alert("Failed to delete song");
      }
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!audioFile || !imageFile) return alert("Please select both files!");
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('artist', artist);
    formData.append('genre', genre);
    formData.append('duration', duration);
    formData.append('audio', audioFile);
    formData.append('image', imageFile);

    try {
      const { data } = await api.post('/songs', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      const newSong = {
        ...data,
        audioUrl: data.audioUrl?.startsWith('http') ? data.audioUrl : `http://localhost:5000${data.audioUrl}`,
        coverImage: data.coverImage?.startsWith('http') ? data.coverImage : `http://localhost:5000${data.coverImage}`
      };
      
      setSongs([newSong, ...songs]);
      
      // Reset Form
      setTitle(''); setArtist(''); setGenre(''); setDuration('');
      setAudioFile(null); setImageFile(null);
      e.target.reset();
      
      alert("Song uploaded successfully!");
    } catch (error) {
      alert(error.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div className="admin-container">
        <Navbar />
        <h2 style={{ textAlign: 'center', marginTop: '40px', color: '#e22134' }}>Access Denied. Admins Only.</h2>
      </div>
    );
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto' }}>
      <Navbar />
      <div className="admin-container">
        <h1 className="admin-header">Admin Dashboard</h1>
        
        <div className="upload-form-container">
          <h2 style={{ marginBottom: '16px' }}>Upload New Song</h2>
          <form className="upload-form" onSubmit={handleUpload}>
            <div className="form-group">
              <label className="form-label">Song Title</label>
              <input type="text" className="form-input" value={title} onChange={e => setTitle(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Artist</label>
              <input type="text" className="form-input" value={artist} onChange={e => setArtist(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Genre</label>
              <input type="text" className="form-input" value={genre} onChange={e => setGenre(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Duration (in seconds)</label>
              <input type="number" className="form-input" value={duration} onChange={e => setDuration(e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Cover Image (.jpg/.png)</label>
              <input type="file" accept="image/*" className="form-input" onChange={e => setImageFile(e.target.files[0])} required />
            </div>
            <div className="form-group">
              <label className="form-label">Audio File (.mp3)</label>
              <input type="file" accept="audio/*" className="form-input" onChange={e => setAudioFile(e.target.files[0])} required />
            </div>
            <button type="submit" className="btn-upload form-group full-width" disabled={uploading}>
              {uploading ? 'Uploading...' : 'Upload Song'}
            </button>
          </form>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Song</th>
              <th>Artist</th>
              <th>Genre</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {songs.map(song => (
              <tr key={song._id}>
                <td>
                  <div className="song-cell">
                    <img 
                      // Safely check if coverImage exists before checking startsWith
                      src={song.coverImage?.startsWith('http') ? song.coverImage : `http://localhost:5000${song.coverImage}`} 
                      alt={song.title} 
                      className="song-cell-img" 
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/40' }} // Fallback if image breaks
                    />
                    <span>{song.title}</span>
                  </div>
                </td>
                <td>{song.artist}</td>
                <td>{song.genre}</td>
                <td>
                  <button className="btn-delete" onClick={() => handleDelete(song._id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Admin;