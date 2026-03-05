import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface SilvIABubbleProps {
  phrase: string
  isTyping: boolean
}

export function SilvIABubble({ phrase, isTyping }: SilvIABubbleProps) {
  const [displayed, setDisplayed] = useState('')
  const [cursor, setCursor] = useState(true)

  useEffect(() => {
    setDisplayed('')
    if (!phrase) return
    let i = 0
    const timer = setInterval(() => {
      if (i < phrase.length) {
        setDisplayed(phrase.slice(0, i + 1))
        i++
      } else {
        clearInterval(timer)
      }
    }, 22)
    return () => clearInterval(timer)
  }, [phrase])

  useEffect(() => {
    const blink = setInterval(() => setCursor((c) => !c), 500)
    return () => clearInterval(blink)
  }, [])

  return (
    <AnimatePresence mode="wait">
      {phrase && (
        <motion.div
          key={phrase}
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="relative max-w-xs"
        >
          {/* Cola de burbuja */}
          <div
            className="absolute -left-3 top-4 w-0 h-0"
            style={{
              borderTop: '8px solid transparent',
              borderBottom: '8px solid transparent',
              borderRight: '12px solid #1a1a3e',
            }}
          />

          <div
            className="relative px-4 py-3 rounded-xl text-sm leading-relaxed"
            style={{
              background: 'linear-gradient(135deg, #0d0d2a 0%, #1a1a3e 100%)',
              border: '1px solid #00ffff44',
              boxShadow: '0 0 15px #00ffff22, inset 0 0 10px #00000033',
              fontFamily: '"Courier New", monospace',
              color: '#c8fff8',
              minHeight: '60px',
            }}
          >
            {/* Header SilvIA */}
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-cyan-900">
              <motion.div
                className="w-2 h-2 rounded-full bg-cyan-400"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
              <span
                style={{
                  fontFamily: 'Orbitron, monospace',
                  fontSize: '9px',
                  color: '#00ffff',
                  letterSpacing: '2px',
                  fontWeight: 700,
                }}
              >
                SilvIA v1.0
              </span>
              {isTyping && (
                <span style={{ fontSize: '8px', color: '#ffd700', marginLeft: 'auto' }}>
                  procesando...
                </span>
              )}
            </div>

            {/* Texto */}
            <p style={{ fontSize: '12px', lineHeight: '1.6' }}>
              {displayed}
              <motion.span
                animate={{ opacity: cursor ? 1 : 0 }}
                style={{ color: '#00ffff', marginLeft: '1px' }}
              >
                |
              </motion.span>
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
