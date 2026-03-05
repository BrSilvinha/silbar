const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const ytdl = require('@distube/ytdl-core')

const app = express()
const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
  },
})

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'] }))
app.use(express.json())

// ===== SOCKET.IO =====
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`)
  socket.on('disconnect', () => {
    console.log(`🔌 Cliente desconectado: ${socket.id}`)
  })
})

// ===== OBTENER INFO DEL VIDEO =====
app.get('/api/info', async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({ error: 'URL requerida, jefe.' })
    }

    if (!ytdl.validateURL(url)) {
      return res.status(400).json({
        error: 'Eso no es una URL de YouTube. Prueba con algo más confiable.',
      })
    }

    const info = await ytdl.getInfo(url)
    const details = info.videoDetails

    res.json({
      title: details.title,
      thumbnail: details.thumbnails[details.thumbnails.length - 1]?.url ?? '',
      duration: parseInt(details.lengthSeconds, 10),
      author: details.author?.name ?? 'Desconocido',
    })
  } catch (err) {
    console.error('Error al obtener info:', err.message)
    res.status(500).json({
      error: 'No pude obtener información del video. ¿Ese link existe?',
    })
  }
})

// ===== DESCARGAR AUDIO =====
app.get('/api/download', async (req, res) => {
  try {
    const { url, socketId } = req.query

    if (!url || !ytdl.validateURL(url)) {
      return res.status(400).json({ error: 'URL inválida. Dámela bien.' })
    }

    const info = await ytdl.getInfo(url)
    const rawTitle = info.videoDetails.title

    // Limpiar caracteres especiales del nombre
    const safeTitle = rawTitle
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .substring(0, 100)
      .trim() || 'descarga'

    res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeTitle)}.mp3`)
    res.setHeader('Content-Type', 'audio/mpeg')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition')

    const stream = ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio',
    })

    stream.on('progress', (_, downloaded, total) => {
      if (socketId && total > 0) {
        const pct = Math.floor((downloaded / total) * 100)
        io.to(socketId).emit('progress', pct)
      }
    })

    stream.on('error', (err) => {
      console.error('Error en stream de descarga:', err.message)
      if (!res.headersSent) {
        res.status(500).json({ error: 'Error durante la descarga. YouTube me puso resistencia.' })
      }
    })

    stream.on('end', () => {
      if (socketId) io.to(socketId).emit('progress', 100)
      console.log(`✅ Descarga completa: ${safeTitle}`)
    })

    stream.pipe(res)
  } catch (err) {
    console.error('Error de descarga:', err.message)
    if (!res.headersSent) {
      res.status(500).json({ error: 'Algo salió mal. Inténtalo de nuevo.' })
    }
  }
})

// ===== HEALTH CHECK =====
app.get('/api/health', (_, res) => {
  res.json({ status: 'ok', message: 'SilvIA está en línea y lista para servir.' })
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
  console.log(`  💫 SilvIA lista para bajar música`)
  console.log(`  🎮 Easter egg: Konami Code activo`)
  console.log('')
})
