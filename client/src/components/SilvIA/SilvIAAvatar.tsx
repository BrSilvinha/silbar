import { motion } from 'framer-motion'

interface SilvIAAvatarProps {
  isSpeaking: boolean
  mood?: 'neutral' | 'happy' | 'thinking' | 'error'
}

export function SilvIAAvatar({ isSpeaking, mood = 'neutral' }: SilvIAAvatarProps) {
  const eyeColor = mood === 'error' ? '#ff4444' : mood === 'happy' ? '#00ff88' : '#00ffff'
  const arcColor = mood === 'error' ? '#ff4444' : '#00ffff'

  return (
    <motion.div
      className="relative select-none"
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
    >
      {/* Halo de fondo */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${eyeColor}22 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <svg
        viewBox="0 0 200 270"
        xmlns="http://www.w3.org/2000/svg"
        className="w-44 h-auto relative z-10"
      >
        <defs>
          <filter id="eyeGlow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="arcGlow">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <linearGradient id="hairGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8e8f0" />
            <stop offset="100%" stopColor="#b0b0c0" />
          </linearGradient>
          <linearGradient id="suitGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a1a2e" />
            <stop offset="100%" stopColor="#0a0a1a" />
          </linearGradient>
          <linearGradient id="skinGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fce8d5" />
            <stop offset="100%" stopColor="#f0c8a0" />
          </linearGradient>
        </defs>

        {/* === CABELLO TRASERO === */}
        <ellipse cx="100" cy="92" rx="53" ry="60" fill="url(#hairGrad)" />

        {/* === CABEZA === */}
        <ellipse cx="100" cy="105" rx="46" ry="50" fill="url(#skinGrad)" />

        {/* === CABELLO FRONTAL === */}
        <path
          d="M54,92 Q56,40 100,34 Q144,40 146,92 Q128,62 100,60 Q72,62 54,92Z"
          fill="#ebebf5"
        />
        {/* Mechones laterales */}
        <path d="M54,92 Q46,115 50,138 Q55,118 62,104Z" fill="#dcdcec" />
        <path d="M146,92 Q154,115 150,138 Q145,118 138,104Z" fill="#dcdcec" />
        {/* Destellos cyan en el cabello */}
        <path
          d="M68,68 Q64,52 78,44"
          stroke="#00ffff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />
        <path
          d="M132,68 Q136,52 122,44"
          stroke="#00ffff"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
          opacity="0.6"
        />

        {/* === OREJAS CON CIRCUITOS === */}
        <ellipse cx="54" cy="108" rx="8" ry="10" fill="url(#skinGrad)" />
        <line x1="46" y1="104" x2="52" y2="104" stroke={eyeColor} strokeWidth="1.5" opacity="0.8" />
        <line x1="45" y1="108" x2="51" y2="108" stroke={eyeColor} strokeWidth="1.5" opacity="0.8" />
        <line x1="46" y1="112" x2="52" y2="112" stroke={eyeColor} strokeWidth="1.5" opacity="0.8" />
        <circle cx="45" cy="108" r="2" fill={eyeColor} opacity="0.9" />

        <ellipse cx="146" cy="108" rx="8" ry="10" fill="url(#skinGrad)" />
        <line x1="154" y1="104" x2="148" y2="104" stroke={eyeColor} strokeWidth="1.5" opacity="0.8" />
        <line x1="155" y1="108" x2="149" y2="108" stroke={eyeColor} strokeWidth="1.5" opacity="0.8" />
        <line x1="154" y1="112" x2="148" y2="112" stroke={eyeColor} strokeWidth="1.5" opacity="0.8" />
        <circle cx="155" cy="108" r="2" fill={eyeColor} opacity="0.9" />

        {/* === CEJAS === */}
        <path
          d="M74,84 Q83,78 92,81"
          stroke="#7a5a4a"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M108,81 Q117,78 126,84"
          stroke="#7a5a4a"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />

        {/* === OJOS === */}
        {/* Ojo izquierdo */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.88, 0.92, 0.96, 1] }}
          style={{ transformOrigin: '83px 97px' }}
        >
          <ellipse cx="83" cy="97" rx="12" ry="11" fill="#051818" />
          <ellipse
            cx="83"
            cy="97"
            rx="10"
            ry="9"
            fill={eyeColor}
            filter="url(#eyeGlow)"
            opacity="0.85"
          />
          <ellipse cx="83" cy="97" rx="5" ry="5" fill="#021212" />
          <circle cx="87" cy="93" r="3" fill="white" opacity="0.75" />
          <ellipse cx="83" cy="97" rx="12" ry="11" fill="none" stroke={eyeColor} strokeWidth="0.5" opacity="0.4" />
        </motion.g>

        {/* Ojo derecho */}
        <motion.g
          animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
          transition={{ duration: 5, repeat: Infinity, times: [0, 0.88, 0.92, 0.96, 1] }}
          style={{ transformOrigin: '117px 97px' }}
        >
          <ellipse cx="117" cy="97" rx="12" ry="11" fill="#051818" />
          <ellipse
            cx="117"
            cy="97"
            rx="10"
            ry="9"
            fill={eyeColor}
            filter="url(#eyeGlow)"
            opacity="0.85"
          />
          <ellipse cx="117" cy="97" rx="5" ry="5" fill="#021212" />
          <circle cx="121" cy="93" r="3" fill="white" opacity="0.75" />
          <ellipse cx="117" cy="97" rx="12" ry="11" fill="none" stroke={eyeColor} strokeWidth="0.5" opacity="0.4" />
        </motion.g>

        {/* === NARIZ === */}
        <circle cx="97" cy="115" r="2" fill="#d4956a" opacity="0.6" />
        <circle cx="103" cy="115" r="2" fill="#d4956a" opacity="0.6" />

        {/* === BOCA (smirk / hablando) === */}
        {isSpeaking ? (
          <motion.path
            d="M87,128 Q100,136 115,128"
            stroke="#d45070"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            animate={{ d: ['M87,128 Q100,136 115,128', 'M87,126 Q100,134 115,126', 'M87,128 Q100,138 115,128'] }}
            transition={{ duration: 0.3, repeat: Infinity }}
          />
        ) : (
          <path
            d="M88,128 Q100,137 114,128"
            stroke="#d45070"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        )}

        {/* === CUELLO === */}
        <rect x="88" y="152" width="24" height="22" rx="5" fill="url(#skinGrad)" />

        {/* === TRAJE / CUERPO === */}
        <rect x="44" y="170" width="112" height="100" rx="12" fill="url(#suitGrad)" />

        {/* Hombros Iron Man rojo */}
        <rect x="44" y="170" width="32" height="9" rx="4" fill="#cc0000" />
        <rect x="124" y="170" width="32" height="9" rx="4" fill="#cc0000" />

        {/* Línea dorada superior */}
        <rect x="44" y="170" width="112" height="3" rx="1.5" fill="#ffd700" opacity="0.8" />

        {/* Línea central vertical */}
        <line x1="100" y1="176" x2="100" y2="265" stroke="#ffd700" strokeWidth="1" opacity="0.3" />

        {/* Detalles laterales del traje */}
        <rect x="52" y="185" width="16" height="3" rx="1.5" fill={eyeColor} opacity="0.5" />
        <rect x="52" y="192" width="12" height="3" rx="1.5" fill={eyeColor} opacity="0.3" />
        <rect x="132" y="185" width="16" height="3" rx="1.5" fill={eyeColor} opacity="0.5" />
        <rect x="136" y="192" width="12" height="3" rx="1.5" fill={eyeColor} opacity="0.3" />

        {/* === ARC REACTOR === */}
        <circle
          cx="100"
          cy="208"
          r="20"
          fill="#020e18"
          stroke={arcColor}
          strokeWidth="2"
          filter="url(#arcGlow)"
        />
        <circle cx="100" cy="208" r="15" fill="#020e18" stroke={arcColor} strokeWidth="1.2" opacity="0.7" />
        {/* Triángulo Iron Man */}
        <polygon
          points="100,195 113,215 87,215"
          fill="none"
          stroke={arcColor}
          strokeWidth="1.5"
          opacity="0.8"
        />
        {/* Núcleo pulsante */}
        <motion.circle
          cx="100"
          cy="208"
          r="7"
          fill={arcColor}
          opacity="0.7"
          filter="url(#arcGlow)"
          animate={{ r: [7, 9, 7], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <circle cx="100" cy="208" r="3" fill="white" opacity="0.9" />

        {/* === BADGE SilvIA === */}
        <rect x="70" y="245" width="60" height="22" rx="4" fill="#080815" stroke="#ffd700" strokeWidth="1.5" />
        <text
          x="100"
          y="260"
          textAnchor="middle"
          fontFamily="'Courier New', monospace"
          fontSize="10"
          fill="#ffd700"
          fontWeight="bold"
          letterSpacing="1"
        >
          SilvIA
        </text>
      </svg>
    </motion.div>
  )
}
