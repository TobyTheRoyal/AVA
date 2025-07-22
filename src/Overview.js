import React, { useState, useEffect } from 'react';
import './styles.css';

function Overview({ openPlaylist }) {
  const [songCount, setSongCount] = useState(0);

  useEffect(() => {
    fetch('/songs.json')
      .then(response => response.json())
      .then(data => setSongCount(data.length))
      .catch(error => console.error('Error loading songs:', error));
  }, []);

  return (
    <div className="overview-container">
      <h1>Meine Playlists</h1>
      <div className="playlist-card" onClick={openPlaylist}>
        <img
          src="/AVA.png"
          alt="Valentine's Cover"
          className="playlist-image"
        />
        <div className="playlist-details">
          <h2>Ava's Playlist</h2>
          <p>{songCount} Songs</p>
        </div>
      </div>
    </div>
  );
}

export default Overview;
