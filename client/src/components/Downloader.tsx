import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from 'axios'
import { PhraseCategory } from '../data/phrases'
import { sounds } from '../utils/sounds'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

const YOUTUBE_REGEX =
  /^https?:\/\/(www\.)?(youtube\.com\/(watch\?v=|shorts\/|playlist\?list=)|youtu\.be\/)[\w\-&=?%]+/i

type Quality = '128' | '192' | '320'

interface SongInfo {
  title: string
  thumbnail: string
  duration: number
  author: string
}

interface SearchResult {
  id: string
  title: string
  url: string
  duration: number
  thumbnail: string
  author: string
}

interface QueueItem {
  id: string
  url: string
  quality: Quality
  status: 'pending' | 'analyzing' | 'ready' | 'downloading' | 'done' | 'error'
  songInfo?: SongInfo
  error?: string
  blobUrl?: string
}

interface DownloaderProps {
  socketId: string
  progress: number
  onPhraseChange: (category: PhraseCategory) => void
  onDownloadStart: () => void
  onDownloadEnd: (success: boolean, song?: SongInfo, audioUrl?: string, sourceUrl?: string) => void
  onQueueAdd?: () => void
  onQueueDone?: () => void
  onSearchOpen?: () => void
  onSearchResult?: () => void
  onCancel?: () => void
  onInputReady?: (el: HTMLInputElement | null) => void
  onAddToQueueReady?: (fn: (url: string) => void) => void
  resetProgress: () => void
}

function formatDuration(seconds: number): string {
  if (!seconds) return '?:??'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

function QualitySelector({ value, onChange }: { value: Quality; onChange: (q: Quality) => void }) {
  const options: Quality[] = ['128', '192', '320']
  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
      <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '7px', color: 'var(--text-muted)', letterSpacing: '1px', marginRight: '4px' }}>
        KBPS
      </span>
      {options.map(q => (
        <motion.button
          key={q}
          onClick={() => onChange(q)}
          whileTap={{ scale: 0.9 }}
          style={{
            padding: '3px 8px',
            borderRadius: '4px',
            fontFamily: 'Orbitron, monospace',
            fontSize: '8px',
            letterSpacing: '1px',
            cursor: 'pointer',
            background: value === q ? 'rgba(255,215,0,0.15)' : 'transparent',
            border: `1px solid ${value === q ? '#ffd700' : '#333355'}`,
            color: value === q ? '#ffd700' : 'var(--text-muted)',
            transition: 'all 0.2s',
          }}
        >
          {q}
        </motion.button>
      ))}
    </div>
  )
}

function StatusBadge({ status }: { status: QueueItem['status'] }) {
  const cfg: Record<QueueItem['status'], { label: string; color: string }> = {
    pending:     { label: 'EN COLA',    color: '#666688' },
    analyzing:   { label: 'ANALIZANDO', color: '#00ffff' },
    ready:       { label: 'LISTO',      color: '#ffd700' },
    downloading: { label: 'BAJANDO',    color: '#00ff88' },
    done:        { label: '✓ LISTO',    color: '#00ff88' },
    error:       { label: '✗ ERROR',    color: '#ff4444' },
  }
  const { label, color } = cfg[status]
  return (
    <span style={{
      fontFamily: 'Orbitron, monospace',
      fontSize: '7px',
      color,
      letterSpacing: '1px',
      padding: '2px 5px',
      borderRadius: '3px',
      border: `1px solid ${color}33`,
      background: `${color}11`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}

export function Downloader({
  socketId,
  progress,
  onPhraseChange,
  onDownloadStart,
  onDownloadEnd,
  onQueueAdd,
  onQueueDone,
  onSearchOpen,
  onSearchResult,
  onCancel,
  onInputReady,
  onAddToQueueReady,
  resetProgress,
}: DownloaderProps) {
  const [url, setUrl] = useState('')
  const [urlWarning, setUrlWarning] = useState('')
  const [quality, setQuality] = useState<Quality>(() => {
    try { return (localStorage.getItem('silbar-quality') as Quality) || '320' } catch { return '320' }
  })
  const [searchMode, setSearchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState('')

  const [queue, setQueue] = useState<QueueItem[]>([])
  const processingRef = useRef(false)
  const abortRef = useRef<AbortController | null>(null)
  const blobUrlsRef = useRef<Map<string, string>>(new Map())
  const inputRef = useRef<HTMLInputElement>(null)
  const queueRef = useRef<QueueItem[]>([])

  // Mantener queueRef sincronizado
  useEffect(() => { queueRef.current = queue }, [queue])

  // Persistir preferencia de calidad
  useEffect(() => {
    try { localStorage.setItem('silbar-quality', quality) } catch {}
  }, [quality])

  // Exponer el input al padre para shortcuts de teclado
  useEffect(() => {
    onInputReady?.(inputRef.current)
  }, [onInputReady])

  // Trigger progress50 cuando el progreso cruza el 50%
  const progress50FiredRef = useRef(false)
  useEffect(() => {
    if (progress >= 50 && !progress50FiredRef.current) {
      progress50FiredRef.current = true
      onPhraseChange('progress50')
    }
    if (progress === 0) progress50FiredRef.current = false
  }, [progress, onPhraseChange])

  // Limpiar blob URLs al desmontar
  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach(u => URL.revokeObjectURL(u))
    }
  }, [])

  // ===== PROCESAMIENTO DE COLA =====
  const processNext = useCallback(async () => {
    if (processingRef.current) return

    const next = queueRef.current.find(i => i.status === 'pending' || i.status === 'ready')
    if (!next) {
      // Cola terminada
      const allDone = queueRef.current.length > 0 && queueRef.current.every(i => i.status === 'done' || i.status === 'error')
      if (allDone && queueRef.current.some(i => i.status === 'done')) {
        onQueueDone?.()
      }
      return
    }

    processingRef.current = true

    if (next.status === 'pending') {
      // Paso 1: analizar
      setQueue(q => q.map(i => i.id === next.id ? { ...i, status: 'analyzing' } : i))
      try {
        const res = await axios.get(`${API}/api/info`, { params: { url: next.url } })
        const songInfo: SongInfo = res.data
        setQueue(q => q.map(i => i.id === next.id ? { ...i, status: 'ready', songInfo } : i))
        if (songInfo.duration > 600) onPhraseChange('largeFile')
        processingRef.current = false
        // Continuar al siguiente paso
        setTimeout(processNext, 100)
      } catch (err) {
        const msg = axios.isAxiosError(err) ? err.response?.data?.error ?? 'Error desconocido' : 'Error de conexión'
        setQueue(q => q.map(i => i.id === next.id ? { ...i, status: 'error', error: msg } : i))
        onPhraseChange('error')
        sounds.error()
        processingRef.current = false
        setTimeout(processNext, 200)
      }
    } else if (next.status === 'ready' && next.songInfo) {
      // Paso 2: descargar
      setQueue(q => q.map(i => i.id === next.id ? { ...i, status: 'downloading' } : i))
      resetProgress()
      onDownloadStart()
      onPhraseChange('downloading')

      abortRef.current = new AbortController()
      try {
        const response = await axios.get(`${API}/api/download`, {
          responseType: 'blob',
          params: { url: next.url, socketId: socketId || '', quality: next.quality },
          signal: abortRef.current.signal,
        })

        const blob = response.data as Blob
        const blobUrl = URL.createObjectURL(blob)
        blobUrlsRef.current.set(next.id, blobUrl)

        const a = document.createElement('a')
        a.href = blobUrl
        a.download = `${next.songInfo.title || 'descarga'}.mp3`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)

        setQueue(q => q.map(i => i.id === next.id ? { ...i, status: 'done', blobUrl } : i))
        onDownloadEnd(true, next.songInfo, blobUrl, next.url)
        sounds.success()
        processingRef.current = false
        setTimeout(processNext, 300)
      } catch (err) {
        if (axios.isCancel(err) || (err as { name?: string }).name === 'CanceledError') {
          setQueue(q => q.map(i => i.id === next.id ? { ...i, status: 'pending' } : i))
          processingRef.current = false
          return
        }
        const msg = axios.isAxiosError(err) ? err.response?.data?.error ?? 'Error en la descarga' : 'Error de conexión'
        setQueue(q => q.map(i => i.id === next.id ? { ...i, status: 'error', error: msg } : i))
        onDownloadEnd(false)
        processingRef.current = false
        setTimeout(processNext, 200)
      }
    } else {
      processingRef.current = false
    }
  }, [socketId, onDownloadStart, onDownloadEnd, onPhraseChange, onQueueDone, resetProgress])

  // Arrancar procesamiento cuando la cola cambia
  useEffect(() => {
    if (!processingRef.current) processNext()
  }, [queue.length, processNext])

  const addToQueue = useCallback((targetUrl: string) => {
    if (!YOUTUBE_REGEX.test(targetUrl)) return
    const existing = queueRef.current.find(i => i.url === targetUrl && i.status !== 'done' && i.status !== 'error')
    if (existing) return

    const isFirstItem = queueRef.current.length === 0
    const newItem: QueueItem = { id: Date.now().toString(), url: targetUrl, quality, status: 'pending' }
    setQueue(q => [...q, newItem])
    setUrl('')
    setUrlWarning('')

    if (!isFirstItem) {
      onQueueAdd?.()
    }
    onPhraseChange('analyzing')
    sounds.analyzing()
  }, [quality, onQueueAdd, onPhraseChange])

  // Exponer addToQueue al padre (para iniciar descargas desde PopularSongs)
  useEffect(() => {
    onAddToQueueReady?.(addToQueue)
  }, [addToQueue, onAddToQueueReady])

  const removeFromQueue = (id: string) => {
    const item = queueRef.current.find(i => i.id === id)
    if (item?.blobUrl) URL.revokeObjectURL(item.blobUrl)
    blobUrlsRef.current.delete(id)
    setQueue(q => q.filter(i => i.id !== id))
  }

  const handleCancel = () => {
    if (abortRef.current) {
      abortRef.current.abort()
      abortRef.current = null
    }
    processingRef.current = false
    onCancel?.()
    onPhraseChange('cancelled')
  }

  const handleUrlChange = (value: string) => {
    setUrl(value)
    if (!value.trim()) { setUrlWarning(''); return }
    if (YOUTUBE_REGEX.test(value)) {
      setUrlWarning('')
      sounds.urlDetected()
    } else if (value.length > 15) {
      setUrlWarning('Solo se aceptan links de YouTube (youtube.com o youtu.be)')
    } else {
      setUrlWarning('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (searchMode) handleSearch()
      else addToQueue(url)
    }
  }

  // ===== BÚSQUEDA =====
  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    setSearchError('')
    setSearchResults([])
    try {
      const res = await axios.get(`${API}/api/search`, { params: { q: searchQuery } })
      setSearchResults(res.data)
      if (res.data.length > 0) onSearchResult?.()
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.error ?? 'Error en la búsqueda' : 'Error de conexión'
      setSearchError(msg)
    } finally {
      setIsSearching(false)
    }
  }

  const handleSelectResult = (result: SearchResult) => {
    setSearchMode(false)
    setSearchResults([])
    setSearchQuery('')
    addToQueue(result.url)
  }

  const toggleSearchMode = () => {
    setSearchMode(s => !s)
    setSearchResults([])
    setSearchError('')
    setUrl('')
    if (!searchMode) onSearchOpen?.()
  }

  const activeItem = queue.find(i => i.status === 'downloading' || i.status === 'analyzing')
  const pendingCount = queue.filter(i => i.status === 'pending' || i.status === 'ready').length
  const doneCount = queue.filter(i => i.status === 'done').length

  return (
    <div className="flex flex-col gap-4 w-full">

      {/* Barra superior: modo toggle + calidad */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Toggle URL / BUSCAR */}
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['link', 'buscar'] as const).map(mode => (
            <motion.button
              key={mode}
              onClick={() => { if (mode === 'buscar') { if (!searchMode) toggleSearchMode() } else { if (searchMode) toggleSearchMode() } }}
              whileTap={{ scale: 0.92 }}
              style={{
                padding: '4px 12px',
                borderRadius: '6px',
                fontFamily: 'Orbitron, monospace',
                fontSize: '8px',
                letterSpacing: '1px',
                cursor: 'pointer',
                background: (mode === 'link') === !searchMode ? 'rgba(0,255,255,0.1)' : 'transparent',
                border: `1px solid ${(mode === 'link') === !searchMode ? '#00ffff' : '#333355'}`,
                color: (mode === 'link') === !searchMode ? '#00ffff' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {mode === 'link' ? '[ LINK ]' : '[ BUSCAR ]'}
            </motion.button>
          ))}
        </div>
        <QualitySelector value={quality} onChange={setQuality} />
      </div>

      {/* Input URL o búsqueda */}
      <div className="relative group">
        <label style={{ fontFamily: 'Orbitron, monospace', fontSize: '9px', color: '#00ffff', letterSpacing: '2px', display: 'block', marginBottom: '8px' }}>
          {searchMode ? 'BUSCAR EN YOUTUBE' : 'PEGA EL LINK DE YOUTUBE'}
        </label>

        <div className="flex gap-2 sm:gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-0 rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"
              style={{ boxShadow: '0 0 15px #00ffff22', pointerEvents: 'none', borderRadius: '8px' }} />
            <input
              ref={inputRef}
              type="text"
              value={searchMode ? searchQuery : url}
              onChange={e => searchMode ? setSearchQuery(e.target.value) : handleUrlChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={searchMode ? 'Nombre del artista o canción...' : 'https://youtube.com/watch?v=...'}
              className="w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg outline-none transition-all duration-200"
              style={{
                background: 'var(--bg-surface)',
                border: `1px solid ${!searchMode && url && YOUTUBE_REGEX.test(url) ? '#00ff8855' : !searchMode && url.length > 15 ? '#cc000055' : 'var(--border)'}`,
                color: 'var(--text)',
                fontFamily: '"Courier New", monospace',
                fontSize: 'clamp(11px, 2vw, 13px)',
              }}
            />
          </div>

          <motion.button
            onClick={searchMode ? handleSearch : () => addToQueue(url)}
            disabled={searchMode ? isSearching || !searchQuery.trim() : !url.trim()}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-3 sm:px-5 py-2.5 sm:py-3 rounded-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              background: searchMode
                ? 'linear-gradient(135deg, #665500, #443300)'
                : 'linear-gradient(135deg, #cc0000, #880000)',
              color: '#fff',
              fontFamily: 'Orbitron, monospace',
              fontSize: 'clamp(9px, 1.5vw, 11px)',
              letterSpacing: '1px',
              boxShadow: isSearching ? 'none' : searchMode ? '0 0 12px #ffd70033' : '0 0 12px #cc000055',
              minWidth: 'clamp(72px, 12vw, 100px)',
              whiteSpace: 'nowrap',
            }}
          >
            {isSearching ? (
              <motion.div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent mx-auto"
                animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }} />
            ) : searchMode ? 'BUSCAR' : (
              queue.length > 0 ? '+ COLA' : 'ANALIZAR'
            )}
          </motion.button>
        </div>

        <AnimatePresence>
          {urlWarning && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ fontFamily: '"Courier New", monospace', fontSize: '11px', color: '#ff8866', marginTop: '6px' }}>
              ⚠ {urlWarning}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Resultados de búsqueda */}
      <AnimatePresence>
        {searchResults.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid #ffd70033', background: 'var(--bg-surface)' }}>
            <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '7px', color: '#ffd700', letterSpacing: '2px', padding: '8px 12px 4px' }}>
              RESULTADOS — click para agregar
            </div>
            {searchResults.map((r, i) => (
              <motion.div key={r.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => handleSelectResult(r)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', cursor: 'pointer', borderTop: '1px solid var(--border)', transition: 'background 0.2s' }}
                className="hover:bg-white/5"
              >
                {r.thumbnail && (
                  <img src={r.thumbnail} alt={r.title}
                    style={{ width: '40px', height: '30px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid var(--border)' }} />
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: '"Courier New", monospace', fontSize: '11px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.title}
                  </p>
                  <p style={{ fontFamily: '"Courier New", monospace', fontSize: '9px', color: 'var(--text-muted)' }}>
                    {r.author} · {formatDuration(r.duration)}
                  </p>
                </div>
                <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '8px', color: '#ffd70066', flexShrink: 0 }}>+</span>
              </motion.div>
            ))}
          </motion.div>
        )}
        {searchError && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ padding: '10px 14px', borderRadius: '8px', background: '#1a0505', border: '1px solid #cc000066', color: '#ff6666', fontFamily: '"Courier New", monospace', fontSize: '12px' }}>
            ⚠ {searchError}
          </motion.div>
        )}
      </AnimatePresence>

      {/* === COLA DE DESCARGAS === */}
      <AnimatePresence>
        {queue.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* Header de la cola */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '8px', color: '#00ffff', letterSpacing: '2px' }}>
                COLA · {doneCount}/{queue.length}
              </span>
              {pendingCount === 0 && doneCount === queue.length && (
                <motion.button
                  onClick={() => setQueue([])}
                  whileTap={{ scale: 0.9 }}
                  style={{ fontFamily: 'Orbitron, monospace', fontSize: '7px', color: 'var(--text-muted)', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', padding: '2px 8px', cursor: 'pointer' }}>
                  LIMPIAR
                </motion.button>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {queue.map(item => (
                <motion.div key={item.id}
                  layout
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 10px',
                    borderRadius: '8px',
                    background: item.status === 'downloading' ? 'rgba(0,255,136,0.05)'
                      : item.status === 'done' ? 'rgba(0,255,136,0.03)'
                      : item.status === 'error' ? 'rgba(204,0,0,0.05)'
                      : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${item.status === 'downloading' ? '#00ff8833'
                      : item.status === 'done' ? '#00ff8822'
                      : item.status === 'error' ? '#cc000044'
                      : 'var(--border)'}`,
                  }}
                >
                  {/* Thumbnail o placeholder */}
                  {item.songInfo?.thumbnail ? (
                    <img src={item.songInfo.thumbnail} alt={item.songInfo.title}
                      style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px', flexShrink: 0, border: '1px solid var(--border)' }} />
                  ) : (
                    <div style={{ width: '32px', height: '32px', borderRadius: '4px', background: 'var(--bg-panel)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--text-subtle)', fontSize: '14px' }}>
                      {item.status === 'analyzing' ? (
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ display: 'block' }}>⟳</motion.span>
                      ) : '♪'}
                    </div>
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: '"Courier New", monospace', fontSize: '10px', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: '2px' }}>
                      {item.songInfo?.title || item.url.substring(0, 35) + '...'}
                    </p>
                    {item.status === 'downloading' && (
                      <div style={{ height: '3px', background: 'var(--border)', borderRadius: '2px', overflow: 'hidden' }}>
                        <motion.div style={{ height: '100%', background: 'linear-gradient(90deg, #cc0000, #ffd700, #00ffff)', borderRadius: '2px' }}
                          animate={{ width: progress > 0 ? `${progress}%` : '8%' }}
                          transition={{ duration: 0.3 }} />
                      </div>
                    )}
                    {item.error && (
                      <p style={{ fontFamily: '"Courier New", monospace', fontSize: '9px', color: '#ff6666', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {item.error}
                      </p>
                    )}
                  </div>

                  {/* Badge de estado */}
                  <StatusBadge status={item.status} />

                  {/* Botón cancelar (solo mientras descarga) */}
                  {item.status === 'downloading' && (
                    <motion.button onClick={handleCancel} whileTap={{ scale: 0.85 }}
                      title="Cancelar"
                      style={{ padding: '3px 6px', borderRadius: '4px', background: 'rgba(204,0,0,0.1)', border: '1px solid #cc000055', color: '#ff6666', fontFamily: 'Orbitron, monospace', fontSize: '8px', cursor: 'pointer' }}>
                      ✕
                    </motion.button>
                  )}

                  {/* Botón reintentar (solo error) */}
                  {item.status === 'error' && (
                    <motion.button
                      onClick={() => setQueue(q => q.map(i => i.id === item.id ? { ...i, status: 'pending', error: undefined } : i))}
                      whileTap={{ scale: 0.85 }}
                      title="Reintentar"
                      style={{ padding: '3px 6px', borderRadius: '4px', background: 'rgba(255,215,0,0.08)', border: '1px solid #ffd70055', color: '#ffd700', fontFamily: 'Orbitron, monospace', fontSize: '8px', cursor: 'pointer' }}>
                      ↺
                    </motion.button>
                  )}

                  {/* Botón quitar (pending/error/done) */}
                  {(item.status === 'pending' || item.status === 'error' || item.status === 'done') && (
                    <motion.button onClick={() => removeFromQueue(item.id)} whileTap={{ scale: 0.85 }}
                      title="Quitar"
                      style={{ padding: '3px 6px', borderRadius: '4px', background: 'transparent', border: '1px solid var(--border)', color: 'var(--text-muted)', fontFamily: 'Orbitron, monospace', fontSize: '8px', cursor: 'pointer' }}>
                      ×
                    </motion.button>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progreso activo (cuando hay item descargando y no se muestra en la cola por alguna razón) */}
      {activeItem?.status === 'downloading' && (
        <AnimatePresence>
          {progress > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', justifyContent: 'space-between', fontFamily: '"Courier New", monospace', fontSize: '10px', color: '#00ffff', marginTop: '-8px' }}>
              <span>Descargando...</span>
              <span>{progress}%</span>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  )
}
