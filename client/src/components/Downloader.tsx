import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { PhraseCategory } from '../data/phrases'

interface SongInfo {
  title: string
  thumbnail: string
  duration: number
  author: string
}

interface DownloaderProps {
  socketId: string
  progress: number
  onPhraseChange: (category: PhraseCategory) => void
  onDownloadStart: () => void
  onDownloadEnd: (success: boolean) => void
  resetProgress: () => void
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function Downloader({
  socketId,
  progress,
  onPhraseChange,
  onDownloadStart,
  onDownloadEnd,
  resetProgress,
}: DownloaderProps) {
  const [url, setUrl] = useState('')
  const [songInfo, setSongInfo] = useState<SongInfo | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleUrlChange = (value: string) => {
    setUrl(value)
    setError('')
    setSongInfo(null)
    if (value.includes('youtube.com') || value.includes('youtu.be')) {
      onPhraseChange('urlPaste')
    }
  }

  const handleAnalyze = async () => {
    if (!url.trim()) return
    setIsLoading(true)
    setError('')
    setSongInfo(null)
    onPhraseChange('analyzing')

    try {
      const res = await axios.get('/api/info', { params: { url } })
      setSongInfo(res.data)
      if (res.data.duration > 600) onPhraseChange('largeFile')
    } catch (err: unknown) {
      const msg = axios.isAxiosError(err)
        ? err.response?.data?.error ?? 'Error desconocido'
        : 'Error de conexión'
      setError(msg)
      onPhraseChange('error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownload = () => {
    if (!songInfo || !url) return
    setIsDownloading(true)
    resetProgress()
    onDownloadStart()
    onPhraseChange('downloading')

    const sid = socketId || ''
    const downloadUrl = `/api/download?url=${encodeURIComponent(url)}&socketId=${encodeURIComponent(sid)}`

    const a = document.createElement('a')
    a.href = downloadUrl
    a.download = `${songInfo.title}.mp3`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Simulamos el final ya que el progreso viene por socket
    setTimeout(() => {
      setIsDownloading(false)
      onDownloadEnd(true)
    }, 3000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze()
  }

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Input de URL */}
      <div className="relative group">
        <label
          style={{
            fontFamily: 'Orbitron, monospace',
            fontSize: '10px',
            color: '#00ffff',
            letterSpacing: '2px',
            display: 'block',
            marginBottom: '8px',
          }}
        >
          PEGA EL LINK DE YOUTUBE
        </label>

        <div className="flex gap-3">
          <div className="relative flex-1">
            {/* Efecto glow en foco */}
            <div
              className="absolute inset-0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
              style={{
                boxShadow: '0 0 15px #00ffff44',
                pointerEvents: 'none',
                borderRadius: '8px',
              }}
            />
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => handleUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="https://youtube.com/watch?v=..."
              className="w-full px-4 py-3 rounded-lg outline-none transition-all duration-200"
              style={{
                background: '#0a0a1e',
                border: '1px solid #1a1a4a',
                color: '#c8fff8',
                fontFamily: '"Courier New", monospace',
                fontSize: '13px',
              }}
              onFocus={(e) =>
                (e.target.style.borderColor = '#00ffff66')
              }
              onBlur={(e) =>
                (e.target.style.borderColor = '#1a1a4a')
              }
            />
          </div>

          <motion.button
            onClick={handleAnalyze}
            disabled={isLoading || !url.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-5 py-3 rounded-lg font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: 'linear-gradient(135deg, #cc0000, #880000)',
              color: '#fff',
              fontFamily: 'Orbitron, monospace',
              fontSize: '11px',
              letterSpacing: '1px',
              boxShadow: isLoading ? 'none' : '0 0 12px #cc000066',
              minWidth: '100px',
            }}
          >
            {isLoading ? (
              <motion.div
                className="w-4 h-4 rounded-full border-2 border-white border-t-transparent mx-auto"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
              />
            ) : (
              'ANALIZAR'
            )}
          </motion.button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-4 py-3 rounded-lg text-sm"
            style={{
              background: '#1a0505',
              border: '1px solid #cc000066',
              color: '#ff6666',
              fontFamily: '"Courier New", monospace',
              fontSize: '12px',
            }}
          >
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info de la canción */}
      <AnimatePresence>
        {songInfo && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="rounded-xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #0a0a1e 0%, #0d0d2a 100%)',
              border: '1px solid #00ffff33',
              boxShadow: '0 0 20px #00ffff11',
            }}
          >
            <div className="flex gap-4 p-4">
              {/* Thumbnail */}
              <div className="relative shrink-0">
                <img
                  src={songInfo.thumbnail}
                  alt={songInfo.title}
                  className="w-20 h-20 rounded-lg object-cover"
                  style={{ border: '1px solid #1a1a4a' }}
                />
                <div
                  className="absolute inset-0 rounded-lg"
                  style={{ boxShadow: 'inset 0 0 15px #00000066' }}
                />
              </div>

              {/* Datos */}
              <div className="flex-1 min-w-0">
                <p
                  className="font-bold truncate mb-1"
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '12px',
                    color: '#ffd700',
                  }}
                >
                  {songInfo.title}
                </p>
                <p
                  className="text-xs mb-1 truncate"
                  style={{ color: '#8888aa', fontFamily: '"Courier New", monospace' }}
                >
                  {songInfo.author}
                </p>
                <p
                  className="text-xs"
                  style={{ color: '#00ffff', fontFamily: '"Courier New", monospace' }}
                >
                  ⏱ {formatDuration(songInfo.duration)}
                </p>
              </div>
            </div>

            {/* Botón de descarga */}
            <div className="px-4 pb-4">
              {isDownloading && progress > 0 ? (
                <div>
                  <div className="flex justify-between text-xs mb-2" style={{ color: '#00ffff', fontFamily: '"Courier New", monospace' }}>
                    <span>Descargando...</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full rounded-full overflow-hidden" style={{ height: '8px', background: '#1a1a3a' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: 'linear-gradient(90deg, #cc0000, #ffd700, #00ffff)',
                        boxShadow: '0 0 8px #ffd700',
                      }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                </div>
              ) : (
                <motion.button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 rounded-lg font-bold text-sm transition-all disabled:opacity-50"
                  style={{
                    background: 'linear-gradient(135deg, #004400, #006600)',
                    color: '#00ff88',
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '11px',
                    letterSpacing: '2px',
                    border: '1px solid #00ff8844',
                    boxShadow: '0 0 12px #00ff8822',
                  }}
                >
                  ▼ DESCARGAR MP3
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
