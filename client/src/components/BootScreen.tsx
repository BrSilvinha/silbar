import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BootScreenProps {
  onComplete: () => void
}

const bootLines = [
  '> SILBAR OS v1.0 iniciando...',
  '> Cargando módulo de audio... OK',
  '> Conectando con servidores... OK',
  '> Activando SilvIA... OK',
  '> Calibrando Arc Reactor... OK',
  '> Modo retro-gamer activado... OK',
  '> Sistema listo.',
  '',
  '  Bienvenido a SILBAR',
]

export function BootScreen({ onComplete }: BootScreenProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let lineIndex = 0
    const addLine = () => {
      if (lineIndex < bootLines.length) {
        setVisibleLines((prev) => [...prev, bootLines[lineIndex]])
        setProgress(Math.round(((lineIndex + 1) / bootLines.length) * 100))
        lineIndex++
        setTimeout(addLine, lineIndex === bootLines.length ? 600 : 280)
      } else {
        setDone(true)
        setTimeout(onComplete, 900)
      }
    }
    setTimeout(addLine, 400)
  }, [onComplete])

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: '#05050f' }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5 }}
        >
          {/* Scanline effect */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <motion.div
              className="absolute left-0 right-0 h-12 opacity-10"
              style={{
                background: 'linear-gradient(transparent, #00ffff33, transparent)',
                top: '-5%',
              }}
              animate={{ top: ['−5%', '105%'] }}
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
              {/* J */}
              <text
                x="8"
                y="65"
                fontFamily="Orbitron, monospace"
                fontSize="62"
                fontWeight="900"
                fill="#cc0000"
                filter="url(#logoGlow)"
              >
                J
              </text>
              {/* S */}
              <text
                x="50"
                y="65"
                fontFamily="Orbitron, monospace"
                fontSize="62"
                fontWeight="900"
                fill="#ffd700"
                filter="url(#logoGlow)"
              >
                S
              </text>
              {/* Línea decorativa */}
              <line x1="5" y1="70" x2="95" y2="70" stroke="#00ffff" strokeWidth="2" opacity="0.6" />
            </svg>
          </motion.div>

          {/* Terminal de boot */}
          <div
            className="w-full max-w-md p-5 rounded-lg"
            style={{
              background: '#0a0a1a',
              border: '1px solid #1a1a4a',
              boxShadow: '0 0 30px #00ffff11',
            }}
          >
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

            <div className="space-y-1 min-h-40">
              {visibleLines
                .map((l) => (l === undefined ? '' : l))
                .map((line, i) => (
                <motion.p
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '12px',
                    color: typeof line === 'string' &&
                      (line.includes('OK')
                        ? '#00ff88'
                        : line.includes('SILBAR')
                        ? '#ffd700'
                        : '#00ffff') ||
                      '#00ffff',
                    lineHeight: '1.8',
                  }}
                >
                  {line || '\u00A0'}
                </motion.p>
              ))}
            </div>

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
          </div