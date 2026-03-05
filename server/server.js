require('dotenv').config()
const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const youtubedl = require('youtube-dl-exec')
const rateLimit = require('express-rate-limit')
const fs = require('fs')
const path = require('path')

const app = express()
const server = http.createServer(app)

const ORIGINS = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:3000').split(',')

const io = new Server(server, {
  cors: { origin: ORIGINS, methods: ['GET', 'POST'] },
})

app.use(cors({ origin: ORIGINS }))
app.use(express.json())

// ===== RATE LIMITING =====
const infoLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Tranquilo, muchas peticiones a la vez. Espera un momento.' },
})
const downloadLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { error: 'Demasiadas descargas en poco tiempo. Espera un minuto.' },
})
const searchLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 15,
  message: { error: 'Muchas búsquedas seguidas. Espera un momento.' },
})

// ===== CLASIFICAR ERRORES DE YT-DLP =====
function classifyError(err) {
  const msg = (err.message || err.stderr || '').toLowerCase()
  if (msg.includes('429') || msg.includes('too many requests')) return 'YouTube nos puso límite. Espera un momento e intenta de nuevo.'
  if (msg.includes('private video') || msg.includes('private')) return 'Ese video es privado. No tengo acceso.'
  if (msg.includes('unavailable') || msg.includes('removed') || msg.includes('deleted')) return 'Ese video no existe o fue eliminado.'
  if (msg.includes('age') || msg.includes('sign in')) return 'Ese video tiene restricción de edad o requiere cuenta.'
  if (msg.includes('econnrefused') || msg.includes('enotfound') || msg.includes('network')) return 'Sin conexión o error de red. Revisa tu internet.'
  if (msg.includes('not a youtube url') || msg.includes('unsupported url')) return 'Esa URL no es reconocida por el sistema.'
  return 'No pude procesar eso. Intenta con otra URL.'
}

// ===== VALIDACION URL YOUTUBE =====
function isYouTubeUrl(url) {
  return typeof url === 'string' &&
    (url.includes('youtube.com') || url.includes('youtu.be'))
}

// ===== POPULAR SONGS — persistido en data/popular.json =====
const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'popular.json')
const popularMap = new Map()

// Cargar datos persistidos al iniciar
;(function loadPopular() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
      for (const item of raw) popularMap.set(item.title, item)
      console.log(`  📊 ${popularMap.size} canciones populares cargadas`)
    }
  } catch (e) {
    console.warn('  ⚠ No se pudo cargar popular.json:', e.message)
  }
})()

function savePopular() {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
    fs.writeFileSync(DATA_FILE, JSON.stringify([...popularMap.values()], null, 2), 'utf8')
  } catch (e) {
    console.warn('⚠ No se pudo guardar popular.json:', e.message)
  }
}

function trackDownload(info, sourceUrl) {
  if (!info?.title) return
  const key = info.title
  const existing = popularMap.get(key) || {
    count: 0,
    title: info.title,
    author: info.uploader ?? info.channel ?? 'Desconocido',
    thumbnail: info.thumbnail ?? '',
    url: sourceUrl ?? '',
  }
  popularMap.set(key, { ...existing, count: existing.count + 1 })
  savePopular()
}

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`)
  socket.on('disconnect', () => console.log(`🔌 Cliente desconectado: ${socket.id}`))
})

// ===== OBTENER INFO DEL VIDEO =====
app.get('/api/info', infoLimit, async (req, res) => {
  try {
    const { url } = req.query
    if (!url) return res.status(400).json({ error: 'URL requerida.' })
    if (!isYouTubeUrl(url)) return res.status(400).json({ error: 'Solo se aceptan links de YouTube.' })

    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noWarnings: true,
      preferFreeFormats: true,
    })

    res.json({
      title: info.title,
      thumbnail: info.thumbnail ?? '',
      duration: Math.floor(info.duration ?? 0),
      author: info.uploader ?? info.channel ?? 'Desconocido',
    })
  } catch (err) {
    console.error('Error al obtener info:', err.message)
    res.status(500).json({ error: classifyError(err) })
  }
})

// ===== BUSQUEDA POR NOMBRE =====
app.get('/api/search', searchLimit, async (req, res) => {
  try {
    const { q } = req.query
    if (!q || typeof q !== 'string' || !q.trim()) {
      return res.status(400).json({ error: 'Término de búsqueda requerido.' })
    }

    const info = await youtubedl(`ytsearch5:${q.trim()}`, {
      dumpSingleJson: true,
      flatPlaylist: true,
      noWarnings: true,
    })

    const entries = Array.isArray(info.entries) ? info.entries : []
    const results = entries.map(e => ({
      id: e.id,
      title: e.title || 'Sin título',
      url: `https://www.youtube.com/watch?v=${e.id}`,
      duration: e.duration ?? 0,
      thumbnail: e.thumbnail ?? e.thumbnails?.[0]?.url ?? '',
      author: e.uploader ?? e.channel ?? e.uploader_id ?? 'Desconocido',
    }))

    res.json(results)
  } catch (err) {
    console.error('Error en búsqueda:', err.message)
    res.status(500).json({ error: classifyError(err) })
  }
})

// ===== DESCARGAR AUDIO =====
app.get('/api/download', downloadLimit, async (req, res) => {
  let proc = null
  try {
    const { url, socketId, quality, playback } = req.query

    if (!url || !isYouTubeUrl(url)) {
      return res.status(400).json({ error: 'URL inválida. Solo YouTube.' })
    }

    // Mapear calidad a parámetro yt-dlp (0=mejor, 5≈128kbps, 2≈192kbps)
    const qualityMap = { '128': 5, '192': 2, '320': 0 }
    const audioQuality = qualityMap[quality] ?? 0

    const info = await youtubedl(url, {
      dumpSingleJson: true,
      noPlaylist: true,
      noWarnings: true,
    })

    if (!playback) trackDownload(info, url)

    const safeTitle = (info.title ?? 'descarga')
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .substring(0, 100)
      .trim() || 'descarga'

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeTitle)}.mp3`)
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    proc = youtubedl.exec(url, {
      extractAudio: true,
      audioFormat: 'mp3',
      audioQuality,
      noPlaylist: true,
      output: '-',
      noWarnings: true,
    })

    proc.stderr.on('data', (chunk) => {
      const text = chunk.toString()
      const match = text.match(/(\d+\.?\d*)%/)
      if (match && socketId) {
        const pct = Math.min(99, Math.floor(parseFloat(match[1])))
        io.to(socketId).emit('progress', pct)
      }
    })

    proc.on('close', (code) => {
      if (code === 0) {
        if (socketId) io.to(socketId).emit('progress', 100)
        console.log(`✅ Descarga completa: ${safeTitle}`)
      } else if (code !== null) {
        console.error(`❌ yt-dlp salió con código: ${code}`)
      }
    })

    proc.catch((err) => {
      if (err.signalCode !== 'SIGTERM') console.error('Error en proceso de descarga:', err.message)
    })

    proc.stdout.pipe(res)
    req.on('close', () => { if (proc) proc.kill() })

  } catch (err) {
    console.error('Error de descarga:', err.message)
    if (proc) proc.kill()
    if (!res.headersSent) res.status(500).json({ error: classifyError(err) })
  }
})

// ===== CANCIONES POPULARES =====
app.get('/api/popular', (_, res) => {
  const top = [...popularMap.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, 6)
  res.json(top)
})

// ===== HEALTH CHECK =====
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'SilvIA v2 está en línea y lista para servir.' })
})

// ===== INICIAR SERVIDOR =====
const PORT = process.env.PORT || 3001
server.listen(PORT, () => {
  console.log('')
  console.log('  ███████╗██╗██╗      ██████╗  █████╗ ██████╗ ')
  console.log('  ██╔════╝██║██║     ██╔══██╗██╔══██╗██╔══██╗')
  console.log('  ███████╗██║██║     ██████╔╝███████║██████╔╝')
  console.log('  ╚════██║██║██║     ██╔══██╗██╔══██║██╔══██╗')
  console.log('  ███████║██║███████╗██████╔╝██║  ██║██║  ██║')
  console.log('  ╚══════╝╚═╝╚══════╝╚═════╝ ╚═╝  ╚═╝╚═╝  ╚═╝')
  console.log('')
  console.log(`  🎵 Servidor corriendo en http://localhost:${PORT}`)
  console.log(`  💫 SilvIA v2 lista para bajar música`)
  console.log(`  🔍 Búsqueda: /api/search?q=nombre`)
  console.log(`  🎮 Easter egg: Konami Code activo`)
  console.log('')
})
