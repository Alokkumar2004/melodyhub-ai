import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import api from '../services/api';

const MusicPlayerContext = createContext();

export const MusicPlayerProvider = ({ children }) => {
  const [currentSong, setCurrentSong] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // NEW: State for Shuffle and Repeat
  const [isShuffle, setIsShuffle] = useState(false);
  const [isRepeat, setIsRepeat] = useState(false);
  
  const audioRef = useRef(new Audio());

  const playSong = (song, newPlaylist = []) => {
    setCurrentSong(song);
    setPlaylist(newPlaylist);
    audioRef.current.src = song.audioUrl;
    audioRef.current.play();
    setIsPlaying(true);
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // NEW: Toggle functions
  const toggleShuffle = () => setIsShuffle(!isShuffle);
  const toggleRepeat = () => setIsRepeat(!isRepeat);

  const playNext = async () => {
    if (!currentSong) return;

    // 1. REPEAT LOGIC: Just start the current song over
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
      return;
    }

    // 2. SHUFFLE LOGIC: Pick a random song from the playlist
    if (isShuffle && playlist.length > 1) {
      let randomIndex = Math.floor(Math.random() * playlist.length);
      // Prevent playing the exact same song twice in a row
      while (playlist[randomIndex].id === currentSong.id) {
        randomIndex = Math.floor(Math.random() * playlist.length);
      }
      playSong(playlist[randomIndex], playlist);
      return;
    }

    // 3. NORMAL NEXT LOGIC
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    
    if (currentIndex !== -1 && currentIndex < playlist.length - 1) {
      playSong(playlist[currentIndex + 1], playlist);
    } else {
      // QUEUE EMPTY! Trigger the Endless Radio AI
      try {
        const { data: nextTrack } = await api.get(`/songs/radio/next/${currentSong.id}`);
        const imageUrl = nextTrack.coverImage.startsWith('http') ? nextTrack.coverImage : `http://localhost:5000${nextTrack.coverImage}`;
        const audioUrl = nextTrack.audioUrl.startsWith('http') ? nextTrack.audioUrl : `http://localhost:5000${nextTrack.audioUrl}`;
        const formattedNextTrack = { ...nextTrack, id: nextTrack._id, image: imageUrl, audioUrl: audioUrl };
        
        playSong(formattedNextTrack, [formattedNextTrack]);
      } catch (error) {
        console.error("Endless Radio failed to find a track:", error);
        setIsPlaying(false);
      }
    }
  };

  const playPrevious = () => {
    if (!currentSong) return;
    const currentIndex = playlist.findIndex(s => s.id === currentSong.id);
    
    // If we are more than 3 seconds in, or repeat is on, just restart the song
    if (audioRef.current.currentTime > 3 || isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
      setIsPlaying(true);
    } else if (currentIndex > 0) {
      playSong(playlist[currentIndex - 1], playlist);
    }
  };

  useEffect(() => {
    const handleSongEnd = () => playNext();
    const currentAudio = audioRef.current;
    
    currentAudio.addEventListener('ended', handleSongEnd);
    return () => currentAudio.removeEventListener('ended', handleSongEnd);
  }, [currentSong, playlist, isShuffle, isRepeat]); // Added new dependencies

  return (
    <MusicPlayerContext.Provider value={{ 
      currentSong, playlist, isPlaying, 
      isShuffle, isRepeat, toggleShuffle, toggleRepeat,
      playSong, togglePlay, playNext, playPrevious, audioRef 
    }}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayer = () => useContext(MusicPlayerContext);