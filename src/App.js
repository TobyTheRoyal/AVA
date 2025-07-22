import React, { useState } from 'react';
import Overview from './Overview';
import Playlist from './Playlist';
import './styles.css';

function App() {
  const [view, setView] = useState('overview'); // "overview" oder "playlist"

  const openPlaylist = () => setView('playlist');
  const goBack = () => setView('overview');

  return (
    <div className="app-container">
      {view === 'overview' ? (
        <Overview openPlaylist={openPlaylist} />
      ) : (
        <Playlist goBack={goBack} />
      )}
    </div>
  );
}

export default App;
