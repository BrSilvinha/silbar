import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BootScreen } from './components/BootScreen'
import { SilvIAAvatar } from './components/SilvIA/SilvIAAvatar'
import { SilvIABubble } from './components/SilvIA/SilvIABubble'
import { Downloader } from './components/Downloader'
import { History, HistoryItem } from './components/History'
import { useSocket } from './hooks/useSocket'
import { getRandomPhrase, getGreetingByHour, PhraseCategory } from './data/phrases'

type Mood = 'neutral' | 'happy' | 'thinking' | 'error'

// Logo JS en SVG
function LogoJS() {
  return (
    <svg viewBox="0 0 110 60" className="w-16 h-auto">
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

export default function App() {
  const [booting, setBooting] = useState(true)
  const [phrase, setPhrase] = useState('')
  const [mood, setMood] = useState<Mood>('neutral')
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [konamiIndex, setKonamiIndex] = useState(0)

  const { socketId, progress, isConnected, resetProgress } = useSocket()

  const KONAMI = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']

  // Saludo inicial tras boot
  const handleBootComplete = useCallback(() => {
    setBooting(false)
    const category = getGreetingByHour()
    setTimeout(() => {
      triggerPhrase(category)
    }, 500)
  }, [])

  // Idle phrases cada 20 segundos
  useEffect(() => {
    if (booting) return
    const timer = setInterval(() => {
      if (!isSpeaking) triggerPhrase('idle')
    }, 20000)
    return () => clearInterval(timer)
  }, [booting, isSpeaking])

  // Konami code
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === KONAMI[konamiIndex]) {
        const next = konamiIndex + 1
        if (next === KONAMI.length) {
          setKonamiIndex(0)
          triggerPhrase('easter')
        } else {
          setKonamiIndex(next)
        }
      } else {
        setKonamiIndex(0)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [konamiIndex])

  function triggerPhrase(category: PhraseCategory, newMood?: Mood) {
    const text = getRandomPhrase(category)
    setPhrase(text)
    setIsSpeaking(true)
    setMood(newMood ?? (category === 'error' ? 'error' : category === 'success' ? 'happy' : 'neutral'))
    setTimeout(() => setIsSpeaking(false), text.length * 22 + 500)
  }

  const handlePhraseChange = useCallback((category: PhraseCategory) => {
    triggerPhrase(category)
  }, [])

  const handleDownloadStart = useCallback(() => {
    setMood('thinking')
  }, [])

  const handleDownloadEnd = useCallback((success: boolean) => {
    if (success) {
      triggerPhrase('success', 'happy')
    } else {
      triggerPhrase('error', 'error')
    }
    setMood('neutral')
  }, [])

  return (
    <>
      <AnimatePresence>{booting && <BootScreen onComplete={handleBootComplete} />}</AnimatePresence>

      {!booting && (
        <motion.div
          className="min-h-screen flex flex-col"
          style={{ background: '#05050f' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          {/* Olas decorativas de fondo (natación) */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute bottom-0 left-0 right-0"
                style={{
                  height: `${120 + i * 40}px`,
                  background: `radial-gradient(ellipse at 50% 100%, ${
                    i === 0 ? '#cc000008' : i === 1 ? '#00ffff05' : '#ffd70004'
                  }, transparent)`,
                  borderRadius: '50% 50% 0 0',
                  bottom: `${-40 + i * 20}px`,
                }}
                animate={{ scaleX: [1, 1.05, 1], y: [0, -5, 0] }}
                transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.8 }}
              />
            ))}
          </div>

          <div className="relative z-10 flex flex-col min-h-screen">
            {/* ===== HEADER ===== */}
            <header
              className="flex items-center justify-between px-6 py-4"
              style={{
                borderBottom: '1px solid #1a1a3a',
                background: 'linear-gradient(180deg, #0a0a1e 0%, transparent 100%)',
              }}
            >
              <div className="flex items-center gap-3">
                <LogoJS />
                <div>
                  <h1
                    className="neon-text-red"
                    style={{
                      fontFamily: '"Press Start 2P", monospace',
                      fontSize: '14px',
                      letterSpacing: '3px',
                    }}
                  >
                    SILBAR
                  </h1>
                  <p
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '9px',
                      color: '#555',
                      letterSpacing: '2px',
                      marginTop: '3px',
                    }}
                  >
                    Silba tu música favorita
                  </p>
                </div>
              </div>

              {/* Status de conexión */}
              <div className="flex items-center gap-2">
                <motion.div
                  className="w-2 h-2 rounded-full"
                  style={{ background: isConnected ? '#00ff88' : '#cc0000' }}
                  animate={{ opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '10px',
                    color: isConnected ? '#00ff88' : '#cc0000',
                  }}
                >
                  {isConnected ? 'ONLINE' : 'OFFLINE'}
                </span>
              </div>
            </header>

            {/* ===== CONTENIDO PRINCIPAL ===== */}
            <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">
              {/* Panel SilvIA + Downloader */}
              <div className="flex flex-col md:flex-row gap-8 items-start">

                {/* === PANEL SILVIA === */}
                <div className="flex flex-col items-center gap-4 md:w-56 shrink-0">
                  <SilvIAAvatar isSpeaking={isSpeaking} mood={mood} />
                  <SilvIABubble phrase={phrase} isTyping={isSpeaking} />
                </div>

                {/* === PANEL DOWNLOADER === */}
                <div
                  className="flex-1 rounded-xl p-6"
                  style={{
                    background: 'linear-gradient(135deg, #0a0a1e 0%, #0d0d22 100%)',
                    border: '1px solid #1a1a3e',
                    boxShadow: '0 0 30px #cc000011',
                  }}
                >
                  {/* Título del panel */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 rounded-full" style={{ background: '#cc0000', boxShadow: '0 0 8px #cc0000' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#ffd700', boxShadow: '0 0 8px #ffd700' }} />
                    <div className="w-3 h-3 rounded-full" style={{ background: '#00ff88', boxShadow: '0 0 8px #00ff88' }} />
                    <span
                      style={{
                        fontFamily: 'Orbitron, monospace',
                        fontSize: '9px',
                        color: '#444',
                        letterSpacing: '2px',
                        marginLeft: '8px',
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
                    resetProgress={resetProgress}
                  />
                </div>
              </div>

              {/* Historial */}
              <History items={history} />

              {/* Easter egg hint */}
              <p
                className="text-center mt-10"
                style={{
                  fontFamily: '"Press Start 2P", monospace',
                  fontSize: '7px',
                  color: '#1a1a3a',
                  letterSpacing: '1px',
                }}
              >
                ↑↑↓↓←→←→BA
              </p>
            </main>

            {/* ===== FOOTER ===== */}
            <footer
              className="text-center py-4 px-6"
              style={{
                borderTop: '1px solid #1a1a3a',
                fontFamily: '"Courier New", monospace',
                fontSize: '10px',
                color: '#333',
              }}
            >
              SILBAR v1.0 — Hecho por{' '}
              <span style={{ color: '#ffd70066' }}>Jhamir Alexander Silva Baldera</span>
              {' '}— powered by SilvIA
            </footer>
          </div>
        </motion.div>
      )}
    </>
  )
}
