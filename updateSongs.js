const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

// Dynamischer Import für node-fetch (v3)
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Cloudinary-Zugangsdaten – ersetze diese mit deinen echten Werten!
const CLOUD_NAME = 'dlb4d1mdm';
const API_KEY = '116992921674754';
const API_SECRET = 'v4b4q_t8LOKxSwpGbdgAmInwHzE';

// Pfad zur Ausgabedatei
const filePath = path.join(__dirname, 'public', 'songs.json');

/**
 * Parst den Public ID (Dateinamen) in Artist und Songtitel.
 * Alle Unterstriche werden durch Leerzeichen ersetzt und falls "_Video_" vorkommt, wird dieser Teil entfernt.
 * Beispiel:
 *   "Outlandish_-_Aicha_Video_mgsv8b" → { artist: "Outlandish", title: "Aicha" }
 */
function parseSongFilename(filename) {
  if (filename.includes("_Video_")) {
    filename = filename.split("_Video_")[0];
  }
  let parts = filename.split(" - ");
  if (parts.length < 2) {
    parts = filename.split("-");
  }
  if (parts.length >= 2) {
    const artist = parts[0].replace(/_/g, ' ').trim();
    const title = parts.slice(1).join(" - ").replace(/_/g, ' ').trim();
    return { artist, title };
  }
  return { artist: filename.replace(/_/g, ' ').trim(), title: filename.replace(/_/g, ' ').trim() };
}

/**
 * Ruft alle Assets aus Cloudinary ab.
 * Hier wird der Resource Type "video" verwendet – passe ggf. auf "raw" um, falls nötig.
 */
async function getAssetList() {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/video/upload?max_results=50`;
  const auth = Buffer.from(`${API_KEY}:${API_SECRET}`).toString('base64');

  const response = await fetch(url, {
    headers: { Authorization: `Basic ${auth}` }
  });

  if (!response.ok) {
    throw new Error(`Fehler beim Abrufen der Liste: ${response.statusText}`);
  }

  const data = await response.json();
  console.log(`Gefundene Assets: ${data.resources.length}`);
  return data.resources;
}

/**
 * Wandelt Sekunden in das Format m:ss um.
 */
function formatDuration(seconds) {
  if (!seconds || isNaN(seconds)) return "-";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

/**
 * Ruft FFprobe auf, um die Dauer aus der angegebenen URL (Cloudinary Delivery URL) zu ermitteln.
 */
function getDurationFromURL(url) {
  return new Promise((resolve, reject) => {
    exec(
      `ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${url}"`,
      (error, stdout, stderr) => {
        if (error) {
          return reject(new Error(`ffprobe error: ${error.message}`));
        }
        const duration = parseFloat(stdout);
        if (isNaN(duration)) {
          return reject(new Error("Unable to parse duration from ffprobe output"));
        }
        resolve(duration);
      }
    );
  });
}

/**
 * Ruft über die iTunes Search API das Cover anhand von Künstler und Songtitel ab.
 */
async function getCoverFromiTunes(artist, title) {
  const query = encodeURIComponent(`${artist} ${title}`);
  const url = `https://itunes.apple.com/search?term=${query}&entity=song&limit=1`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0].artworkUrl100;
    }
    return "";
  } catch (error) {
    console.error(`Fehler beim Abrufen des Covers von iTunes für ${artist} - ${title}:`, error);
    return "";
  }
}

/**
 * Phase 1: Aktualisiert songs.json ohne Cover.
 * Hier werden alle Songs aus Cloudinary abgerufen, der Public ID geparst und die Dauer ermittelt.
 * Das Ergebnis wird in songs.json geschrieben.
 */
async function updateSongsWithoutCovers() {
  let songs = [];
  
  try {
    const assets = await getAssetList();
    songs = assets.map(asset => {
      const parsed = parseSongFilename(asset.public_id);
      return {
        artist: parsed.artist,
        title: parsed.title,
        id: asset.public_id,
        duration: "",
        cover: "" // zunächst leer
      };
    });
  } catch (error) {
    console.error("Fehler beim Abrufen der Asset-Liste:", error);
    return;
  }

  // Für jeden Song: Ermittele die Dauer
  for (let song of songs) {
    try {
      const url = `https://res.cloudinary.com/${CLOUD_NAME}/video/upload/v1739029576/${song.id}.mp3`;
      console.log(`Abrufen der Dauer von: ${url}`);
      const durationSec = await getDurationFromURL(url);
      song.duration = formatDuration(durationSec);
      console.log(`Dauer für ${song.artist} - ${song.title}: ${song.duration}`);
    } catch (error) {
      console.error(`Fehler beim Ermitteln der Dauer für ${song.artist} - ${song.title}:`, error);
      song.duration = "-";
    }
  }

  // Schreibe die Songs ohne Cover in die JSON
  fs.writeFileSync(filePath, JSON.stringify(songs, null, 2));
  console.log("Phase 1 abgeschlossen: songs.json ohne Cover wurde aktualisiert!");
}

/**
 * Phase 2: Liest die bestehende songs.json, holt das Cover von iTunes und aktualisiert die Datei.
 * Es werden dabei die Künstler und Songtitel verwendet, die in der bereits erstellten songs.json vorhanden sind.
 */
async function updateCovers() {
  // Lese die bereits gespeicherten Songs aus songs.json
  let songs = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  
  // Für jeden Song: Ermittele das Cover von iTunes
  for (let song of songs) {
    try {
      const coverUrl = await getCoverFromiTunes(song.artist, song.title);
      song.cover = coverUrl; // Falls kein Cover gefunden wird, bleibt der String leer
      console.log(`Cover für ${song.artist} - ${song.title}: ${song.cover}`);
    } catch (error) {
      console.error(`Fehler beim Abrufen des Covers für ${song.artist} - ${song.title}:`, error);
      song.cover = "";
    }
  }
  
  // Schreibe die aktualisierte JSON in die Datei
  fs.writeFileSync(filePath, JSON.stringify(songs, null, 2));
  console.log("Phase 2 abgeschlossen: songs.json mit iTunes-Covers wurde aktualisiert!");
}

/**
 * Exportiere die Funktionen, damit du sie separat ausführen kannst.
 */
module.exports = {
  updateSongsWithoutCovers,
  updateCovers
};

// Falls du das Skript direkt ausführst, kannst du Phase 1 als Standardaktion starten:
// node updateSongs.js
if (require.main === module) {
  updateSongsWithoutCovers()
    .then(() => console.log("Führe anschließend 'node -e \"require('./updateSongs').updateCovers()\"' aus, um die Cover zu aktualisieren."))
    .catch(error => console.error(error));
}