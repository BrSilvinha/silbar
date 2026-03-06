import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootScreenProps {
  onComplete: () => void
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'
const IS_LOCAL = API.includes('localhost')
const MAX_ATTEMPTS = 3
const RETRY_DELAY_S = 12 // segundos entre reintentos (Render tarda ~10-20s en despertar)
const TOTAL_LINES = 9   // 2 pre + 1 check + 6 post

const PRE_LINES = [
  '> SILBAR OS v2.0 iniciando...',
  '> Cargando módulo de audio... OK',
]

const POST_LINES = [
  '> Activando SilvIA... OK',
  '> Calibrando Arc Reactor... OK',
  '> Modo retro-gamer activado... OK',
  '> Sistema listo.',
  '',
  '  Bienvenido a SILBAR',
]

const sleep = (ms: number) => new Promise<void>(r => setTimeout(r, ms))

async function pingHealth(): Promise<boolean> {
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 10_000)
  try {
    const res = await fetch(`${API}/api/health`, { signal: ac.signal, cache: 'no-store' })
    clearTimeout(timer)
    return res.ok
  } catch {
    clearTimeout(timer)
    return false
  }
}

type Phase = 'booting' | 'checking' | 'retrying' | 'error' | 'finishing'

export function BootScreen({ onComplete }: BootScreenProps) {
  const [lines, setLines] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<Phase>('booting')
  const [retryCountdown, setRetryCountdown] = useState(0)
  const [done, setDone] = useState(false)
  const [runKey, setRunKey] = useState(0)

  useEffect(() => {
    let cancelled = false

    const push = (line: string, idx: number) => {
      if (cancelled) return
      setLines((prev: string[]) => [...prev, line])
      setProgress(Math.round(((idx + 1) / TOTAL_LINES) * 100))
    }

    const replaceLast = (newLine: string) => {
      if (cancelled) return
      setLines((prev: string[]) => {
        const copy = [...prev]
        copy[copy.length - 1] = newLine
        return copy
      })
    }

    ;(async () => {
      let i = 0

      // Líneas previas al check
      await sleep(400)
      for (const line of PRE_LINES) {
        if (cancelled) return
        push(line, i++)
        await sleep(280)
      }

      // Línea del check (sin resultado todavía)
      if (cancelled) return
      push('> Conectando con servidor...', i)
      setPhase('checking')

      // Intentos de health check (soporta Render free tier cold start)
      let ok = false
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !ok; attempt++) {
        if (cancelled) return

        if (attempt > 0) {
          // Countdown antes de reintentar
          setPhase('retrying')
          for (let s = RETRY_DELAY_S; s > 0; s--) {
            if (cancelled) return
            setRetryCountdown(s)
            await sleep(1000)
          }
          if (cancelled) return
          setPhase('checking')
        }

        ok = await pingHealth()
      }

      if (cancelled) return

      if (!ok) {
        replaceLast('> Conectando con servidor... FALLO')
        setPhase('error')
        return
      }

      // Servidor OK — continuar boot
      replaceLast('> Conectando con servidor... OK')
      i++ // avanzar el contador pasado la línea del check
      setPhase('finishing')

      for (const line of POST_LINES) {
        if (cancelled) return
        await sleep(280)
        push(line, i++)
      }

      if (cancelled) return
      await sleep(600)
      if (cancelled) return
      setDone(true)
      await sleep(900)
      if (cancelled) return
      onComplete()
    })()

    return () => { cancelled = true }
  }, [onComplete, runKey])

  const handleRetry = () => {
    setLines([])
    setProgress(0)
    setPhase('booting')
    setDone(false)
    setRetryCountdown(0)
    setRunKey((k: number) => k + 1)
  }

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: '#05050f' }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          {/* Scanline */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-0 right-0 h-12 opacity-10"
              style={{
                background: 'linear-gradient(transparent, #00ffff33, transparent)',
                top: '-5%',
              }}
              animate={{ top: ['-5%', '105%'] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* Logo JS */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.8, type: 'spring', bounce: 0.4 }}
            className="mb-8"
          >
            <svg viewBox="0 0 100 80" className="w-28 h-auto">
              <defs>
                <filter id="logoGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              <text x="8" y="65" fontFamily="Orbitron, monospace" fontSize="62" fontWeight="900" fill="#cc0000" filter="url(#logoGlow)">J</text>
              <text x="50" y="65" fontFamily="Orbitron, monospace" fontSize="62" fontWeight="900" fill="#ffd700" filter="url(#logoGlow)">S</text>
              <line x1="5" y1="70" x2="95" y2="70" stroke="#00ffff" strokeWidth="2" opacity="0.6" />
            </svg>
          </motion.div>

          {/* Terminal */}
          <div
            className="w-full max-w-md p-5 rounded-lg"
            style={{
              background: '#0a0a1a',
              border: '1px solid #1a1a4a',
              boxShadow: '0 0 30px #00ffff11',
            }}
          >
            {/* Barra de título */}
            <div className="flex gap-2 mb-3">
              <div className="w-3 h-3 rounded-full bg-red-500 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400 opacity-80" />
              <div className="w-3 h-3 rounded-full bg-green-400 opacity-80" />
              <span
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '9px',
                  color: '#555',
                  marginLeft: '8px',
                  lineHeight: '12px',
                }}
              >
                SILBAR_OS_TERMINAL
              </span>
            </div>

            {/* Líneas de boot */}
            <div className="space-y-1 min-h-40">
              {lines.map((line: string, idx: number) => (
                <motion.p
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '12px',
                    color: line?.includes('FALLO')
                      ? '#cc0000'
                      : line?.includes('OK')
                      ? '#00ff88'
                      : line?.includes('SILBAR')
                      ? '#ffd700'
                      : '#00ffff',
                    lineHeight: '1.8',
                  }}
                >
                  {line || '\u00A0'}
                </motion.p>
              ))}

              {/* Estado dinámico mientras verifica / reintenta */}
              {(phase === 'checking' || phase === 'retrying') && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '12px',
                    color: '#ffd700',
                    lineHeight: '1.8',
                  }}
                >
                  {phase === 'checking'
                    ? '>>> verificando conexión...'
                    : `>>> servidor iniciando, reintentando en ${retryCountdown}s...`}
                </motion.p>
              )}
            </div>

            {/* Caja de error */}
            {phase === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: '16px',
                  padding: '12px',
                  borderRadius: '6px',
                  background: 'rgba(204,0,0,0.08)',
                  border: '1px solid rgba(204,0,0,0.3)',
                }}
              >
                <p
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '11px',
                    color: '#cc4444',
                    marginBottom: '10px',
                    lineHeight: '1.7',
                  }}
                >
                  [ERROR] No se pudo conectar con el servidor.<br />
                  {IS_LOCAL
                    ? 'Inicia el backend: cd server && npm run dev'
                    : 'Verifica que el backend esté activo en Render.'}
                </p>
                <motion.button
                  onClick={handleRetry}
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '9px',
                    letterSpacing: '2px',
                    color: '#00ffff',
                    background: 'transparent',
                    border: '1px solid #00ffff44',
                    borderRadius: '4px',
                    padding: '6px 14px',
                    cursor: 'pointer',
                  }}
                >
                  [ REINTENTAR ]
                </motion.button>
              </motion.div>
            )}

            {/* Barra de progreso */}
            <div className="mt-4">
              <div
                className="w-full rounded-full overflow-hidden"
                style={{ height: '6px', background: '#1a1a3a' }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #cc0000, #ffd700)',
                    boxShadow: '0 0 8px #ffd700',
                  }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.25 }}
                />
              </div>
              <p
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '10px',
                  color: '#555',
                  marginTop: '4px',
                  textAlign: 'right',
                }}
              >
                {progress}%
              </p>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
