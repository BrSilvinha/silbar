import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const TIPS = [
  { icon: '↵', text: 'Presiona Enter para analizar el link rapidamente' },
  { icon: '♪', text: 'Pega el link y SilvIA lo detecta al instante' },
  { icon: '✓', text: 'Los Shorts de YouTube tambien funcionan' },
  { icon: '⚡', text: 'MP3 alta calidad, listo para tu coleccion' },
  { icon: '★', text: '↑↑↓↓←→←→BA activa el modo secreto' },
  { icon: '∞', text: 'Sin limite de descargas en la sesion' },
  { icon: '☑', text: 'El historial guarda tus descargas del dia' },
  { icon: '→', text: 'Los links youtu.be cortos tambien funcionan' },
]

const INTERVAL_MS = 4000

export function TipsPanel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % TIPS.length), INTERVAL_MS)
    return () => clearInterval(t)
  }, [])

  const tip = TIPS[index]

  return (
    <div
      className="rounded-xl p-4 panel-theme"
      style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-panel) 100%)',
        border: '1px solid var(--border)',
        minHeight: '88px',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: '8px',
          color: '#aa88ff',
          letterSpacing: '2px',
          marginBottom: '10px',
        }}
      >
        TIPS_SILBAR
      </div>

      {/* Tip con animacion */}
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          className="flex items-start gap-3"
        >
          <span
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '14px',
              color: '#aa88ff',
              lineHeight: 1,
              marginTop: '1px',
              flexShrink: 0,
            }}
          >
            {tip.icon}
          </span>
          <p
            style={{
              fontFamily: '"Courier New", monospace',
              fontSize: '11px',
              color: 'var(--text-muted)',
              lineHeight: 1.6,
            }}
          >
            {tip.text}
          </p>
        </motion.div>
      </AnimatePresence>

      {/* Indicadores de progreso */}
      <div className="flex gap-1 mt-3">
        {TIPS.map((_, i) => (
          <motion.div
            key={i}
            style={{
              height: '2px',
              flex: 1,
              borderRadius: '1px',
              background: i === index ? '#aa88ff' : 'var(--border)',
            }}
            animate={{
              background: i === index ? '#aa88ff' : 'var(--border)',
              scaleX: i === index ? 1 : 1,
            }}
            transition={{ duration: 0.3 }}
          />
        ))}
      </div>
    </div>
  )
}
