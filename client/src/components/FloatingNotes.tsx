import { motion } from 'framer-motion'
import { useMemo } from 'react'

const NOTE_CHARS = ['♪', '♫', '♩', '♬', '♭', '♮', '♯']

export function FloatingNotes({ isDark }: { isDark: boolean }) {
  // Valores deterministas (sin Math.random en render) para evitar re-calculos
  const notes = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => ({
      id: i,
      char: NOTE_CHARS[i % NOTE_CHARS.length],
      x: 3 + (i / 14) * 94 + (((i * 137) % 10) - 5),  // % horizontal
      duration: 9 + ((i * 73) % 10),                    // segundos
      delay: (i * 17) % 12,                              // segundos
      size: 11 + ((i * 31) % 14),                        // px
      drift: ((i * 43) % 80) - 40,                       // px, puede ser negativo
      hue: 160 + (i * 22),
    }))
  }, [])

  const opacity = isDark ? 0.3 : 0.18

  return (
    <div
      className="fixed inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 2 }}
    >
      {notes.map(({ id, char, x, duration, delay, size, drift, hue }) => (
        <motion.span
          key={id}
          // initial con valores numéricos (px) — Framer Motion los trata igual
          initial={{ y: 0, x: 0, opacity: 0 }}
          animate={{
            // Todos numéricos: evita el error "keyframes must be of the same type"
            y: [0, -2400],
            x: [0, drift],
            opacity: [0, opacity, opacity, 0],
          }}
          transition={{
            y: { duration, delay, repeat: Infinity, ease: 'linear' },
            x: { duration, delay, repeat: Infinity, ease: 'linear' },
            opacity: {
              duration,
              delay,
              repeat: Infinity,
              ease: 'linear',
              times: [0, 0.07, 0.85, 1],
            },
          }}
          style={{
            position: 'absolute',
            left: `${x}%`,
            bottom: 0,
            fontSize: `${size}px`,
            color: `hsl(${hue}, 88%, ${isDark ? 65 : 44}%)`,
            userSelect: 'none',
            lineHeight: 1,
          }}
        >
          {char}
        </motion.span>
      ))}
    </div>
  )
}
