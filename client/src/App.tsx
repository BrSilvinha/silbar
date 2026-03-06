import { useState, useCallback, useEffect, useRef, useMemo, memo } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { BootScreen } from './components/BootScreen'
import { SilvIAAvatar } from './components/SilvIA/SilvIAAvatar'
import { SilvIABubble } from './components/SilvIA/SilvIABubble'
import { Downloader } from './components/Downloader'
import { History, HistoryItem } from './components/History'
import { FloatingNotes } from './components/FloatingNotes'
import { NowPlaying } from './components/NowPlaying'
import { PopularSongs } from './components/PopularSongs'
import { useSocket } from './hooks/useSocket'
import { getRandomPhrase, getGreetingByHour, PhraseCategory } from './data/phrases'
import { sounds } from './utils/sounds'
import { getFrequencyBars } from './utils/audioStore'

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

type Mood = 'neutral' | 'happy' | 'thinking' | 'error' | 'excited' | 'searching'

function LogoJS() {
  return (
    <svg viewBox="0 0 110 60" className="w-10 sm:w-12 md:w-14 h-auto shrink-0">
      <defs>
        <filter id="lglow">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <text x="2" y="52" fontFamily="Orbitron,monospace" fontSize="54" fontWeight="900" fill="#cc0000" filter="url(#lglow)">J</text>
      <text x="52" y="52" fontFamily="Orbitron,monospace" fontSize="54" fontWeight="900" fill="#ffd700" filter="url(#lglow)">S</text>
    </svg>
  )
}

// Panel de estadísticas del sistema (solo xl+)
// StatsSidebar usa memo para evitar re-renders del padre (App) cada 60fps
const StatsSidebar = memo(function StatsSidebar({
  isConnected,
  isConnecting,
  downloadCount,
  isDark,
}: {
  isConnected: boolean
  isConnecting: boolean
  downloadCount: number
  isDark: boolean
}) {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(t)
  }, [])

  // Refs para actualizar alturas de barras directamente sin React re-render
  const barRefs = useRef<(HTMLDivElement | null)[]>([])
  const rafRef = useRef<number>(0)
  const idleHeights = useMemo(
    () => Array.from({ length: 8 }, (_, i) => 28 + ((i * 47 + 30) % 65)),
    []
  )

  useEffect(() => {
    let t = 0
    const loop = (ts: number) => {
      t = ts
      const bars = getFrequencyBars(8)
      const hasMusic = bars.some(v => v > 4)
      barRefs.current.forEach((el, i) => {
        if (!el) return
        if (hasMusic) {
          // Frecuencia real con suavizado via transition CSS
          el.style.height = `${Math.max(6, bars[i])}%`
        } else {
          // Animación idle: onda senoidal suave
          const h = 12 + idleHeights[i] * 0.45 * (0.5 + 0.5 * Math.sin(t / 500 + i * 0.6))
          el.style.height = `${h}%`
        }
      })
      rafRef.current = requestAnimationFrame(loop)
    }
    rafRef.current = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafRef.current)
  }, [idleHeights])

  const timeStr = time.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })

  const stats = [
    { label: 'ESTADO', value: isConnected ? 'ONLINE' : isConnecting ? 'CONECTANDO' : 'OFFLINE', color: isConnected ? '#00ff88' : isConnecting ? '#ffd700' : '#cc0000', dot: true },
    { label: 'HORA', value: timeStr, color: '#00ffff', dot: false },
    { label: 'SESION', value: `${downloadCount} DL`, color: '#ffd700', dot: false },
    { label: 'MOTOR', value: 'yt-dlp', color: '#aa88ff', dot: false },
    { label: 'FORMATO', value: 'MP3 / HQ', color: '#ff88cc', dot: false },
  ]

  const panelStyle = {
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '10px 12px',
    transition: 'background 0.4s, border-color 0.4s',
  } as const

  return (
    <div className="flex flex-col gap-2.5">
      <div
        style={{
          ...panelStyle,
          fontFamily: 'Orbitron, monospace',
          fontSize: '9px',
          color: '#00ffff',
          letterSpacing: '2px',
          textAlign: 'center',
        }}
      >
        SYS_MONITOR
      </div>

      {stats.map(({ label, value, color, dot }) => (
        <div key={label} style={panelStyle}>
          <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>
            {label}
          </div>
          <div style={{ fontFamily: '"Courier New", monospace', fontSize: '13px', color, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
            {dot && (
              <motion.span
                style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', background: color, boxShadow: `0 0 5px ${color}`, flexShrink: 0 }}
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              />
            )}
            {value}
          </div>
        </div>
      ))}

      {/* Ecualizador — barras controladas via DOM refs (sin re-renders) */}
      <div style={panelStyle}>
        <div style={{ fontFamily: 'Orbitron, monospace', fontSize: '8px', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '8px' }}>
          AUDIO_VIZ
        </div>
        <div className="flex items-end gap-0.5" style={{ height: '36px' }}>
          {Array.from({ length: 8 }, (_, i) => (
            <div
              key={i}
              ref={el => { barRefs.current[i] = el }}
              style={{
                flex: 1,
                borderRadius: '2px',
                minHeight: '2px',
                background: `hsl(${155 + i * 25}, 100%, ${isDark ? 55 : 42}%)`,
                transition: 'height 0.06s ease',
                height: '12%',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
})

export default function App() {
  const [booting, setBooting] = useState(() => !sessionStorage.getItem('silbar-booted'))
  const [phrase, setPhrase] = useState('')
  const [mood, setMood] = useState<Mood>('neutral')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isSleeping, setIsSleeping] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    // Cargar historial de las últimas 24h desde localStorage
    try {
      const saved = localStorage.getItem('silbar-history')
      if (!saved) return []
      const DAY = 24 * 60 * 60 * 1000
      return (JSON.parse(saved) as HistoryItem[])
        .filter(item => Date.now() - new Date(item.downloadedAt).getTime() < DAY)
        .map(item => ({ ...item, downloadedAt: new Date(item.downloadedAt), audioUrl: undefined }))
    } catch { return [] }
  })
  const [currentSong, setCurrentSong] = useState<HistoryItem | null>(null)
  const [playlistItems, setPlaylistItems] = useState<HistoryItem[]>([])
  const [playlistIdx, setPlaylistIdx] = useState(-1)
  const [isLoadingPlayback, setIsLoadingPlayback] = useState(false)
  const [konamiIndex, setKonamiIndex] = useState(0)
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem('silbar-theme') !== 'light' } catch { return true }
  })
  const sleepTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const nowPlayingToggleRef = useRef<(() => void) | null>(null)
  const downloaderInputRef = useRef<HTMLInputElement | null>(null)
  const blobCacheRef = useRef<Map<string, string>>(new Map())
  const addToQueueRef = useRef<((url: string) => void) | null>(null)

  const { socketId, progress, isConnected, isConnecting, resetProgress } = useSocket()
  const KONAMI = ['ArrowUp','ArrowUp','ArrowDown','ArrowDown','ArrowLeft','ArrowRight','ArrowLeft','ArrowRight','b','a']

  // Tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light')
    try { localStorage.setItem('silbar-theme', isDark ? 'dark' : 'light') } catch {}
  }, [isDark])

  // Persistir historial (sin audioUrl — los blob URLs son temporales)
  useEffect(() => {
    try {
      const toSave = history.map(({ audioUrl: _a, ...rest }) => rest)
      localStorage.setItem('silbar-history', JSON.stringify(toSave))
    } catch {}
  }, [history])

  // Timer de inactividad: SilvIA se duerme tras 40s sin interacción
  useEffect(() => {
    if (booting) return
    const resetSleepTimer = () => {
      setIsSleeping(false)
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current)
      sleepTimerRef.current = setTimeout(() => setIsSleeping(true), 40000)
    }
    resetSleepTimer()
    document.addEventListener('mousemove', resetSleepTimer, { passive: true })
    document.addEventListener('keydown', resetSleepTimer)
    document.addEventListener('click', resetSleepTimer)
    return () => {
      if (sleepTimerRef.current) clearTimeout(sleepTimerRef.current)
      document.removeEventListener('mousemove', resetSleepTimer)
      document.removeEventListener('keydown', resetSleepTimer)
      document.removeEventListener('click', resetSleepTimer)
    }
  }, [booting])

  const handleBootComplete = useCallback(() => {
    sessionStorage.setItem('silbar-booted', '1')
    setBooting(false)
    setTimeout(() => triggerPhrase(getGreetingByHour()), 500)
  }, [])

  useEffect(() => {
    if (booting) return
    const timer = setInterval(() => { if (!isSpeaking && !isSleeping) triggerPhrase('idle') }, 45000)
    return () => clearInterval(timer)
  }, [booting, isSpeaking, isSleeping])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiIndex]) {
        const next = konamiIndex + 1
        if (next === KONAMI.length) { setKonamiIndex(0); triggerPhrase('easter') }
        else setKonamiIndex(next)
      } else {
        setKonamiIndex(0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [konamiIndex])

  function triggerPhrase(category: PhraseCategory, newMood?: Mood) {
    setIsSleeping(false)
    const text = getRandomPhrase(category)
    setPhrase(text)
    setIsSpeaking(true)
    const effectiveMood: Mood = newMood ?? (
      category === 'error' ? 'error'
      : category === 'queueDone' ? 'excited'
      : category === 'success' ? 'happy'
      : category === 'searching' ? 'searching'
      : 'neutral'
    )
    setMood(effectiveMood)
    const dur = text.length * 22 + 500
    setTimeout(() => {
      setIsSpeaking(false)
      if (effectiveMood !== 'neutral') setTimeout(() => setMood('neutral'), 1500)
    }, dur)
  }

  // Keyboard shortcuts: Space = play/pause | Ctrl+V = foco en input
  useEffect(() => {
    if (booting) return
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      const inInput = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      // Space: play/pause (solo fuera de inputs)
      if (e.code === 'Space' && !e.ctrlKey && !e.altKey && !e.metaKey && !inInput) {
        e.preventDefault()
        nowPlayingToggleRef.current?.()
      }

      // "/" : llevar foco al input del downloader (como YouTube/GitHub)
      if (e.key === '/' && !inInput && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        downloaderInputRef.current?.focus()
        downloaderInputRef.current?.select()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [booting])

  // Auto-descarga silenciosa cuando currentSong tiene sourceUrl pero no audioUrl
  // (ocurre al cargar del historial después de un refresco, o al navegar playlist)
  useEffect(() => {
    if (!currentSong || currentSong.audioUrl || !currentSong.sourceUrl) return
    // Verificar cache primero (evita re-descargar en misma sesión)
    const cached = blobCacheRef.current.get(currentSong.sourceUrl)
    if (cached) {
      setCurrentSong(prev => prev?.id === currentSong.id ? { ...prev, audioUrl: cached } : prev)
      return
    }
    let cancelled = false
    const doLoad = async () => {
      setIsLoadingPlayback(true)
      try {
        const quality = localStorage.getItem('silbar-quality') || '320'
        const res = await axios.get(`${API}/api/download`, {
          responseType: 'blob',
          params: { url: currentSong.sourceUrl, quality, playback: '1' },
        })
        if (cancelled) return
        const blobUrl = URL.createObjectURL(res.data as Blob)
        blobCacheRef.current.set(currentSong.sourceUrl!, blobUrl)
        setCurrentSong(prev => prev?.id === currentSong.id ? { ...prev, audioUrl: blobUrl } : prev)
      } catch {
        // fallo silencioso — el usuario puede reintentar clicando en historial
      } finally {
        if (!cancelled) setIsLoadingPlayback(false)
      }
    }
    doLoad()
    return () => { cancelled = true }
  }, [currentSong?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handlePlayPlaylist = useCallback((items: HistoryItem[], shuffle: boolean) => {
    const ordered = shuffle ? [...items].sort(() => Math.random() - 0.5) : [...items]
    setPlaylistItems(ordered)
    setPlaylistIdx(0)
    setCurrentSong(ordered[0]) // auto-download useEffect se encarga de obtener el audio
  }, [])

  const handlePlaylistNext = useCallback(() => {
    setPlaylistIdx(prev => {
      const next = prev + 1
      if (next >= playlistItems.length) return prev
      setCurrentSong(playlistItems[next])
      return next
    })
  }, [playlistItems])

  const handlePlaylistPrev = useCallback(() => {
    setPlaylistIdx(prev => {
      const p = prev - 1
      if (p < 0) return prev
      setCurrentSong(playlistItems[p])
      return p
    })
  }, [playlistItems])

  const handleSongEnded = useCallback(() => {
    if (playlistItems.length === 0) return
    const next = playlistIdx + 1
    if (next >= playlistItems.length) { setPlaylistItems([]); setPlaylistIdx(-1); return }
    setPlaylistIdx(next)
    setCurrentSong(playlistItems[next])
  }, [playlistIdx, playlistItems])

  const handlePlaySingle = useCallback((item: HistoryItem) => {
    setPlaylistItems([])
    setPlaylistIdx(-1)
    setCurrentSong(item) // auto-download useEffect se encarga si no hay audioUrl
  }, [])

  const handlePhraseChange = useCallback((category: PhraseCategory) => { triggerPhrase(category) }, [])
  const handleDownloadStart = useCallback(() => { setMood('thinking'); sounds.downloadStart() }, [])
  const handleDownloadEnd = useCallback((
    success: boolean,
    song?: { title: string; author: string; thumbnail: string },
    audioUrl?: string,
    sourceUrl?: string
  ) => {
    if (success && song) {
      triggerPhrase('success', 'happy')
      const item: HistoryItem = {
        id: Date.now().toString(),
        title: song.title, author: song.author, thumbnail: song.thumbnail,
        downloadedAt: new Date(), audioUrl, sourceUrl,
      }
      setHistory(prev => [...prev, item])
      setCurrentSong(item)
    } else {
      triggerPhrase('error', 'error')
      sounds.error()
    }
  }, [])

  const handleQueueAdd = useCallback(() => { triggerPhrase('queueAdd', 'neutral') }, [])
  const handleQueueDone = useCallback(() => { triggerPhrase('queueDone', 'excited') }, [])
  const handleSearchOpen = useCallback(() => { triggerPhrase('searching', 'searching') }, [])
  const handleSearchResult = useCallback(() => { triggerPhrase('searchResult', 'neutral') }, [])
  const handleCancel = useCallback(() => { triggerPhrase('cancelled', 'neutral') }, [])

  const toggleTheme = () => { sounds.toggle(); setIsDark(d => !d) }

  return (
    <>
      <AnimatePresence>{booting && <BootScreen onComplete={handleBootComplete} />}</AnimatePresence>

      {!booting && (
        <motion.div
          className="min-h-screen flex flex-col"
          style={{ background: 'var(--bg-main)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Notas musicales flotantes */}
          <FloatingNotes isDark={isDark} />

          {/* Grid de fondo */}
          <div
            className="fixed inset-0 pointer-events-none"
            style={{
              backgroundImage: `linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)`,
              backgroundSize: '48px 48px',
              zIndex: 0,
            }}
          />

          {/* Destellos de esquina */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            <motion.div className="absolute top-0 left-0" style={{ width: '40vw', height: '40vh', background: 'radial-gradient(ellipse at top left, #cc000010, transparent)' }} animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 6, repeat: Infinity }} />
            <motion.div className="absolute top-0 right-0" style={{ width: '40vw', height: '40vh', background: 'radial-gradient(ellipse at top right, #00ffff08, transparent)' }} animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 5, repeat: Infinity, delay: 1 }} />
            <motion.div className="absolute bottom-0 right-0" style={{ width: '35vw', height: '35vh', background: 'radial-gradient(ellipse at bottom right, #ffd70008, transparent)' }} animate={{ opacity: [0.6, 1, 0.6] }} transition={{ duration: 7, repeat: Infinity, delay: 2 }} />
            <motion.div className="absolute bottom-0 left-0" style={{ width: '30vw', height: '30vh', background: 'radial-gradient(ellipse at bottom left, #aa88ff08, transparent)' }} animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 8, repeat: Infinity, delay: 3 }} />
          </div>

          {/* Olas de fondo */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: `${120 + i * 40}px`,
                  background: `radial-gradient(ellipse at 50% 100%, ${i === 0 ? '#cc000009' : i === 1 ? '#00ffff06' : '#ffd70004'}, transparent)`,
                  borderRadius: '50% 50% 0 0',
                  bottom: `${-40 + i * 20}px`,
                }}
                animate={{ scaleX: [1, 1.06, 1], y: [0, -6, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
              />
            ))}
          </div>

          <div className="relative flex flex-col min-h-screen" style={{ zIndex: 3 }}>
            {/* ===== HEADER ===== */}
            <header
              className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-2.5 sm:py-3"
              style={{
                borderBottom: '1px solid var(--border)',
                background: 'linear-gradient(180deg, var(--bg-surface) 0%, transparent 100%)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
              }}
            >
              {/* Logo + titulo */}
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <LogoJS />
                <div className="min-w-0">
                  <h1
                    className="neon-text-red"
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: 'clamp(9px, 2.5vw, 14px)',
                      letterSpacing: '2px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    SILBAR
                  </h1>
                  <p
                    className="hidden sm:block"
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '8px',
                      color: 'var(--text-muted)',
                      letterSpacing: '1px',
                      marginTop: '2px',
                    }}
                  >
                    Silba tu musica favorita
                  </p>
                </div>
              </div>

              {/* Controles del header */}
              <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                {/* Toggle de tema */}
                <motion.button
                  onClick={toggleTheme}
                  whileHover={{ scale: 1.08 }}
                  whileTap={{ scale: 0.92 }}
                  title={isDark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
                  style={{
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontFamily: 'Orbitron, monospace',
                    fontSize: 'clamp(7px, 1.5vw, 9px)',
                    letterSpacing: '1px',
                    color: isDark ? '#ffd700' : '#5555cc',
                    boxShadow: isDark ? '0 0 6px #ffd70022' : '0 0 6px #5555cc22',
                    transition: 'all 0.3s',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {isDark ? '[ CLARO ]' : '[ OSCURO ]'}
                </motion.button>

                {/* Estado de conexion */}
                <div className="flex items-center gap-1.5">
                  <motion.div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: isConnected ? '#00ff88' : isConnecting ? '#ffd700' : '#cc0000' }}
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ duration: isConnecting ? 0.7 : 1.5, repeat: Infinity }}
                  />
                  <span
                    className="hidden sm:inline"
                    style={{
                      fontFamily: '"Courier New", monospace',
                      fontSize: '10px',
                      color: isConnected ? '#00ff88' : isConnecting ? '#ffd700' : '#cc0000',
                    }}
                  >
                    {isConnected ? 'ONLINE' : isConnecting ? 'CONECTANDO...' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </header>

            {/* ===== CONTENIDO PRINCIPAL ===== */}
            <main className="flex-1 px-3 sm:px-4 md:px-6 py-4 sm:py-6 w-full max-w-7xl mx-auto">

              {/* Fila principal */}
              <div className="flex flex-col lg:flex-row gap-4 lg:gap-6 items-start">

                {/* ===== COLUMNA SILVIA ===== */}
                {/* Mobile: fila horizontal compacta | Desktop: columna vertical */}
                <div className="w-full lg:w-52 shrink-0">
                  {/* En movil: avatar pequeño + bubble en fila */}
                  <div className="flex flex-row lg:flex-col items-start lg:items-center gap-3 lg:gap-4">
                    {/* Avatar — escala segun pantalla */}
                    <div
                      className="shrink-0"
                      style={{ width: 'clamp(80px, 18vw, 208px)', overflow: 'visible' }}
                    >
                      <SilvIAAvatar isSpeaking={isSpeaking} mood={mood} isSleeping={isSleeping} />
                    </div>
                    {/* Bubble — ocupa el espacio restante en movil */}
                    <div className="flex-1 lg:flex-none lg:w-full">
                      <SilvIABubble phrase={phrase} isTyping={isSpeaking} />
                    </div>
                  </div>
                </div>

                {/* ===== COLUMNA CENTRAL: DOWNLOADER ===== */}
                <div className="flex-1 w-full min-w-0">
                  <div
                    className="rounded-xl p-4 sm:p-5 md:p-6 panel-theme"
                    style={{
                      background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-panel) 100%)',
                      border: '1px solid var(--border-glow)',
                      boxShadow: `0 0 30px var(--card-shadow)`,
                    }}
                  >
                    {/* Titulo tipo terminal */}
                    <div className="flex items-center gap-2 mb-5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#cc0000', boxShadow: '0 0 5px #cc0000' }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#ffd700', boxShadow: '0 0 5px #ffd700' }} />
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 5px #00ff88' }} />
                      <span
                        style={{
                          fontFamily: 'Orbitron, monospace',
                          fontSize: '8px',
                          color: 'var(--text-muted)',
                          letterSpacing: '2px',
                          marginLeft: '6px',
                        }}
                      >
                        PANEL DE DESCARGA
                      </span>
                    </div>

                    <Downloader
                      socketId={socketId}
                      progress={progress}
                      onPhraseChange={handlePhraseChange}
                      onDownloadStart={handleDownloadStart}
                      onDownloadEnd={handleDownloadEnd}
                      onQueueAdd={handleQueueAdd}
                      onQueueDone={handleQueueDone}
                      onSearchOpen={handleSearchOpen}
                      onSearchResult={handleSearchResult}
                      onCancel={handleCancel}
                      onInputReady={el => { downloaderInputRef.current = el }}
                      onAddToQueueReady={fn => { addToQueueRef.current = fn }}
                      resetProgress={resetProgress}
                    />
                  </div>
                </div>

                {/* ===== COLUMNA DERECHA: NowPlaying + Tips + Stats ===== */}
                <div
                  className="flex flex-col gap-3 shrink-0 w-full md:w-56 lg:w-52 xl:w-56"
                >
                  <NowPlaying
                    song={currentSong}
                    onToggleReady={fn => { nowPlayingToggleRef.current = fn }}
                    onSongEnded={handleSongEnded}
                    onNext={playlistItems.length > 0 ? handlePlaylistNext : undefined}
                    onPrev={playlistItems.length > 0 ? handlePlaylistPrev : undefined}
                    hasPrev={playlistIdx > 0}
                    hasNext={playlistIdx < playlistItems.length - 1}
                    isLoadingPlayback={isLoadingPlayback}
                    isPlaylist={playlistItems.length > 0}
                    playlistPosition={playlistItems.length > 0 ? `${playlistIdx + 1}/${playlistItems.length}` : undefined}
                  />
                  <PopularSongs onDownload={url => addToQueueRef.current?.(url)} />
                  {/* Stats en lg+ */}
                  <div className="hidden lg:block">
                    <StatsSidebar isConnected={isConnected} isConnecting={isConnecting} downloadCount={history.length} isDark={isDark} />
                  </div>
                </div>
              </div>

              {/* Historial */}
              <History
                items={history}
                currentSongId={currentSong?.id}
                onPlaySingle={handlePlaySingle}
                onPlayAll={(items) => handlePlayPlaylist(items, false)}
                onShuffle={(items) => handlePlayPlaylist(items, true)}
              />

              {/* Easter egg hint */}
              <p
                className="text-center mt-8 sm:mt-10"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '6px',
                  color: 'var(--text-subtle)',
                  letterSpacing: '1px',
                  opacity: 0.35,
                }}
              >
                ↑↑↓↓←→←→BA
              </p>
            </main>

            {/* ===== FOOTER ===== */}
            <footer
              className="text-center py-3 sm:py-4 px-4 sm:px-6"
              style={{
                borderTop: '1px solid var(--border)',
                fontFamily: '"Courier New", monospace',
                fontSize: 'clamp(8px, 1.5vw, 10px)',
                color: 'var(--text-muted)',
              }}
            >
              SILBAR v2.0 &mdash; Hecho por{' '}
              <span style={{ color: '#ffd70077' }}>Jhamir Alexander Silva Baldera</span>
              {' '}&mdash; powered by SilvIA
            </footer>
          </div>
        </motion.div>
      )}
    </>
  )
}
