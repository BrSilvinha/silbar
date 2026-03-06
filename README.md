<div align="center">

# 🎵 SILBAR

**Retro-styled YouTube audio downloader with an AI companion**

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/badge/license-MIT-blue?style=flat-square)](LICENSE)

[Live Demo](https://silbar.vercel.app) · [Report Bug](https://github.com/BrSilvinha/silbar/issues) · [Request Feature](https://github.com/BrSilvinha/silbar/issues)

</div>

---

## Overview

SILBAR is a full-stack web app that lets you download audio from YouTube as MP3 files directly in the browser. Built with a retro cyberpunk aesthetic and powered by an interactive AI companion named **SilvIA** that reacts to everything you do.

Real-time download progress, search, playback history, playlists, and a trending songs board — all in one place.

---

## Features

- **YouTube Audio Download** — Download any YouTube video as MP3 at 128, 192, or 320 kbps
- **YouTube Search** — Search directly in the app without leaving the page
- **Real-time Progress** — Download progress streamed live via Socket.IO
- **In-browser Playback** — Full audio player with play/pause, seek, volume, next/prev, and shuffle
- **Download History** — Persistent 24-hour history with custom playlist builder
- **Popular Songs** — Tracks the most downloaded songs across all sessions
- **SilvIA AI Companion** — Animated avatar that reacts to your actions with contextual dialogue
- **Download Queue** — Queue multiple downloads and manage them simultaneously
- **Age-restricted Support** — Optional YouTube cookie support for restricted content
- **Audio Visualizer** — Real-time frequency bars while playing
- **Keyboard Shortcuts** — `Space` to play/pause, `/` to focus search
- **Easter Egg** — Konami code: ↑↑↓↓←→←→BA

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS 3, Framer Motion |
| Backend | Node.js, Express 4 |
| Real-time | Socket.IO 4 |
| YouTube | yt-dlp, @distube/ytdl-core |
| Deploy (client) | Vercel |
| Deploy (server) | Render |

---

## Local Development

### Prerequisites

- Node.js 18+
- [yt-dlp](https://github.com/yt-dlp/yt-dlp) installed and in PATH
- ffmpeg installed and in PATH

### Clone & Install

```bash
git clone https://github.com/BrSilvinha/silbar.git
cd silbar

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Environment Variables

**`server/.env`**

```env
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173
# Optional: base64-encoded YouTube cookies for age-restricted videos
# YT_COOKIES_B64=<your_base64_cookies>
```

**`client/.env`**

```env
VITE_API_URL=http://localhost:3001
```

### Run

```bash
# Terminal 1 — Start the server
cd server && npm run dev

# Terminal 2 — Start the client
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Deployment

### Backend → Render

The `server/render.yaml` config is included. On build, it automatically:
- Downloads the latest `yt-dlp` binary
- Installs `ffmpeg`

Set the `ALLOWED_ORIGINS` environment variable in Render to your Vercel frontend URL.

### Frontend → Vercel

The `client/vercel.json` config handles SPA routing. Set `VITE_API_URL` to your Render server URL in Vercel's environment variables.

---

## Project Structure

```
silbar/
├── client/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/     # UI components (Downloader, NowPlaying, History, SilvIA...)
│   │   ├── hooks/          # useSocket, useAudioPlayer
│   │   └── utils/          # Web Audio API, audio store
│   └── vercel.json
└── server/                 # Express backend
    ├── server.js           # Main server (API + Socket.IO)
    ├── data/popular.json   # Persisted popular songs
    └── render.yaml
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/info` | Get video metadata (title, thumbnail, duration) |
| GET | `/api/search?q=query` | Search YouTube (top 5 results) |
| GET | `/api/download?url=&quality=` | Stream MP3 with progress events |
| GET | `/api/popular` | Get top 6 most downloaded songs |
| GET | `/api/health` | Health check |

---

## License

MIT © [BrSilvinha](https://github.com/BrSilvinha)
