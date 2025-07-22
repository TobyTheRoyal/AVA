# Ava Playlist

Dieses Projekt ist eine kleine React-Anwendung, die eine einfache Playlist darstellt. In der Übersicht siehst du eine Playlist-Karte. Beim Anklicken gelangst du zur Playlist, in der du die Songs abspielen kannst.

## Features

- Übersicht mit Anzahl der Songs (aus `public/songs.json` geladen).
- Wiedergabeliste mit Play/Pause, Zurück und Weiter.
- Fortschrittsanzeige inklusive Scrub-Funktion.
- Songinformationen (Artist, Titel, Dauer) werden aus einer JSON-Datei geladen.
- Optionales Skript zum Aktualisieren der Songliste aus Cloudinary.

## Projektstruktur

- `src/` – React-Komponenten und Styles.
  - `App.js` verwaltet die Ansichten Übersicht/Playlist.
  - `Overview.js` zeigt die vorhandenen Playlists an.
  - `Playlist.js` spielt die Songs ab.
  - `styles.css` enthält das Design.
- `public/` – Statische Dateien, darunter `songs.json` mit den Metadaten und `index.html`.
- `updateSongs.js` – Node-Skript, um die Songliste anhand deiner Cloudinary‑Assets zu erstellen und Cover von iTunes zu laden.

## Installation

1. Stelle sicher, dass Node.js und npm installiert sind.
2. Installiere die Abhängigkeiten:
   ```bash
   npm install
   ```

## Entwicklung starten

Starte die Entwicklungsumgebung mit:
```bash
npm start
```
Die Anwendung ist anschließend unter `http://localhost:3000` erreichbar.

## Produktion

Für einen Produktionsbuild kannst du Folgendes ausführen:
```bash
npm run build
```
Der Build befindet sich anschließend im Ordner `build/`.

## Tests

Die Standard-Tests von `react-scripts` können mit
```bash
npm test
```
aufgerufen werden.

(Beachte, dass in dieser Beispielumgebung die Dependencies nicht installiert sind und der Befehl fehlschlagen kann.)

## Songliste aktualisieren

Das Skript `updateSongs.js` liest deine Audio-Assets aus Cloudinary aus, ermittelt die Dauer per `ffprobe` und ergänzt über die iTunes Search API passende Cover. Beispielaufruf für Phase 1:
```bash
node updateSongs.js
```
Für Phase 2 (Cover laden) kannst du danach ausführen:
```bash
node -e "require('./updateSongs').updateCovers()"
```
Passe dafür die Cloudinary-Zugangsdaten im Skript an.

## Lizenz

Dieses Projekt steht ohne spezielle Lizenz zur Verfügung.
