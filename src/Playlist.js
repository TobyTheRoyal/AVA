import React, { useState, useEffect, useRef } from 'react';
import { FaPlay, FaPause, FaStepForward, FaStepBackward, FaRegClock } from 'react-icons/fa';
import './styles.css';

const CLOUD_NAME = "dlb4d1mdm"; // Ersetze mit deinem Cloudinary Cloud-Namen
const BASE_URL = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/`;

function Playlist({ goBack }) {
  const [songs, setSongs] = useState([]);
  const [currentSongIndex, setCurrentSongIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef(null);

  useEffect(() => {
    fetch('/songs.json')
      .then(response => response.json())
      .then(data => setSongs(data))
      .catch(error => console.error('Error loading songs:', error));
  }, []);

  useEffect(() => {
    if (currentSongIndex !== null && songs.length > 0) {
      // Lade die neue Audioquelle nur, wenn sie sich ändert
      if (audioRef.current.src !== `${BASE_URL}${songs[currentSongIndex].id}.mp3`) {
        audioRef.current.src = `${BASE_URL}${songs[currentSongIndex].id}.mp3`;
        audioRef.current.load();
        setCurrentTime(0);
      }
      audioRef.current.play().catch(error => console.error('Error playing audio:', error));
      setIsPlaying(true); // AUTOMATISCH Play setzen, wenn ein neuer Song ausgewählt wird
    }
  }, [currentSongIndex, songs]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handleSongClick = (index) => {
    // Wenn der angeklickte Song bereits der aktuell laufende Song ist…
    if (currentSongIndex === index) {
      // …und er gerade spielt, dann pausieren
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        // Falls er nicht spielt, dann abspielen
        audioRef.current.play().catch(error => console.error('Play error:', error));
        setIsPlaying(true);
      }
    } else {
      // Wenn ein anderer Song angeklickt wird, diesen auswählen und abspielen
      setCurrentSongIndex(index);
      setIsPlaying(true);
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause(); // Nur pausieren
      setIsPlaying(false);
    } else {
      if (currentSongIndex !== null) {
        audioRef.current.play().catch(error => console.error('Play error:', error));
      }
      setIsPlaying(true);
    }
  };

  // Funktion zum Überspringen zum nächsten Song
  const skipSong = () => {
    if (songs.length > 0) {
      const nextIndex = currentSongIndex === null ? 0 : (currentSongIndex + 1) % songs.length;
      setCurrentSongIndex(nextIndex);
      setIsPlaying(true);
    }
  };

  // Neue Funktion zum Springen zum vorherigen Song
  const previousSong = () => {
    if (songs.length > 0) {
      const prevIndex = currentSongIndex === null 
        ? 0 
        : (currentSongIndex - 1 + songs.length) % songs.length;
      setCurrentSongIndex(prevIndex);
      setIsPlaying(true);
    }
  };

  // Funktionen rewind und fastForward bleiben erhalten, falls du sie später verwenden möchtest
  const rewind = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const fastForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleScrub = (event) => {
    const newTime = parseFloat(event.target.value);
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60) || 0;
    const seconds = Math.floor(time % 60) || 0;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  const percentage = duration ? (currentTime / duration) * 100 : 0;

  return (
    <div className="playlist-page">
      <button className="back-btn" onClick={goBack}>← Back</button>
      <div className="playlist-header">
        <img
          src="/AVA.png"
          alt="Valentine's Cover"
          className="playlist-header-image"
        />
        <h1>Ava's Playlist</h1>
      </div>
      {/* Songlisten-Bereich */}
      <div className="songs-list">
        {/* Header der Songliste */}
        <div className="songs-list-header">
          <div className="header-number">#</div>
          <div className="header-title">Title</div>
          <div className="header-duration">
            <FaRegClock size={16} />
          </div>
        </div>
        {/* Songzeilen */}
        {/* Songzeilen */}
{songs.map((song, index) => (
  <div
    key={index}
    className="song-list-item"
    onClick={() => handleSongClick(index)}
  >
    <div className="song-number">
      {isPlaying && index === currentSongIndex ? (
        <div className="equalizer">
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>
      ) : (
        index + 1
      )}
    </div>
    <div className="song-info">
      {song.cover && (
        <img
          src={song.cover}
          alt={`${song.title} cover`}
          className="song-cover"
        />
      )}
      <div className="song-details">
        {/* Füge hier die aktive Klasse hinzu */}
        <div className={`song-title ${isPlaying && index === currentSongIndex ? 'active' : ''}`}>
          {song.title}
        </div>
        <div className="song-artist">{song.artist}</div>
      </div>
    </div>
    <div className="song-duration">{song.duration || '-'}</div>
  </div>
))}
      </div>
      
      {/* Fixiertes Control-Panel */}
      <div className="control-card">
        {currentSongIndex !== null && (
          <div className="control-content">
            {/* Linke Spalte: Cover, Titel & Künstler, ganz links */}
            <div className="control-info">
              {songs[currentSongIndex].cover && (
                <img
                  src={songs[currentSongIndex].cover}
                  alt="Cover"
                  className="control-cover"
                />
              )}
              <div className="control-text">
                <div className="control-title">{songs[currentSongIndex].title}</div>
                <div className="control-artist">{songs[currentSongIndex].artist}</div>
              </div>
            </div>
            {/* Rechte Spalte: Steuerungselemente und Fortschrittsanzeige, mittig */}
            <div className="control-controls">
              <div className="buttons-section">
                <button className="control-btn other" onClick={previousSong}>
                  <FaStepBackward size={20} />
                </button>
                <button className="control-btn play-pause" onClick={togglePlayPause}>
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                </button>
                <button className="control-btn other" onClick={skipSong}>
                  <FaStepForward size={20} />
                </button>
              </div>
              <div className="progress-section">
                <span className="time-display">{formatTime(currentTime)}</span>
                <input
                  type="range"
                  min="0"
                  max={duration}
                  step="0.1"
                  value={currentTime}
                  onChange={handleScrub}
                  className="progress-bar"
                  style={{
                    background: `linear-gradient(to right, var(--primary-color) ${percentage}%, #888 ${percentage}%)`
                  }}
                />
                <span className="time-display">{formatTime(duration)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={skipSong}
        controls
        style={{ display: 'none' }}
      />
    </div>
  );
}

export default Playlist;