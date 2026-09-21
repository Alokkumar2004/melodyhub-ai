import React, { useState, useEffect } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat } from 'lucide-react';
import { useMusicPlayer } from '../context/MusicPlayerContext';
import './BottomPlayer.css';

const BottomPlayer = () => {
  const { 
    currentSong, isPlaying, togglePlay, playNext, playPrevious, audioRef,
    isShuffle, isRepeat, toggleShuffle, toggleRepeat 
  } = useMusicPlayer();
  
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
    };
  }, [audioRef]);

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const handleSeek = (e) => {
    const newTime = Number(e.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolume = (e) => {
    audioRef.current.volume = Number(e.target.value);
  };

  if (!currentSong) {
    return <div className="bottom-player" style={{ pointerEvents: 'none', opacity: 0.3 }}></div>;
  }

  // NEW: Calculate the percentage of the song that has played
  const progressPercent = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="bottom-player">
      <div className="player-left">
        <img src={currentSong.image} alt={currentSong.title} className="player-cover" />
        <div className="player-info">
          <div className="player-title">{currentSong.title}</div>
          <div className="player-artist">{currentSong.artist}</div>
        </div>
      </div>

      <div className="player-center">
        <div className="player-controls">
          <button className="control-btn" onClick={toggleShuffle} title="Shuffle">
            <Shuffle size={18} color={isShuffle ? "#1db954" : "#b3b3b3"} />
          </button>
          
          <button className="control-btn" onClick={playPrevious}>
            <SkipBack size={20} color="#b3b3b3" />
          </button>
          
          <button 
            className="control-btn play-pause-btn" 
            onClick={togglePlay}
            style={{ backgroundColor: !isPlaying ? '#1db954' : 'white' }}
          >
            {isPlaying ? <Pause size={18} color="black" /> : <Play size={18} color="black" style={{ marginLeft: '2px' }} />}
          </button>
          
          <button className="control-btn" onClick={playNext}>
            <SkipForward size={20} color="#b3b3b3" />
          </button>

          <button className="control-btn" onClick={toggleRepeat} title="Repeat">
            <Repeat size={18} color={isRepeat ? "#1db954" : "#b3b3b3"} />
          </button>
        </div>
        
        <div className="progress-container">
          <span className="time-text">{formatTime(currentTime)}</span>
          <input 
            type="range" 
            className="progress-bar" 
            min="0" 
            max={duration || 100} 
            value={currentTime} 
            onChange={handleSeek}
            /* NEW: Dynamically fill the background with green based on progress */
            style={{
              background: `linear-gradient(to right, #1db954 ${progressPercent}%, #4d4d4d ${progressPercent}%)`
            }}
          />
          <span className="time-text">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="player-right">
        <Volume2 size={20} color="#b3b3b3" />
        <input 
          type="range" 
          className="volume-bar" 
          min="0" 
          max="1" 
          step="0.01" 
          defaultValue="1" 
          onChange={handleVolume} 
        />
      </div>
    </div>
  );
};

export default BottomPlayer;