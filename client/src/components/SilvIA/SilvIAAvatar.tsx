import { motion, useMotionValue } from 'framer-motion'
import { useEffect } from 'react'
import { getAudioIntensity } from '../../utils/audioStore'

interface SilvIAAvatarProps {
  isSpeaking: boolean
  mood?: 'neutral' | 'happy' | 'thinking' | 'error' | 'excited' | 'searching'
  isSleeping?: boolean
}

export function SilvIAAvatar({ isSpeaking, mood = 'neutral', isSleeping = false }: SilvIAAvatarProps) {
  const eyeColor = isSleeping
    ? '#5555aa'
    : mood === 'error'
    ? '#ff4444'
    : mood === 'happy'
    ? '#00ff88'
    : mood === 'excited'
    ? '#ff88cc'
    : mood === 'searching'
    ? '#ffd700'
    : '#00ffff'

  const arcColor = isSleeping
    ? '#5555aa'
    : mood === 'error'
    ? '#ff4444'
    : mood === 'excited'
    ? '#ff88cc'
    : mood === 'searching'
    ? '#ffd700'
    : '#00ffff'

  // Silbando: cuando descarga (thinking) y no está hablando ni durmiendo
  const isWhistling = !isSpeaking && !isSleeping && mood === 'thinking'

  // MotionValue para escalar la boca al ritmo del audio — sin re-renders
  const whistleScaleY = useMotionValue(1)
  useEffect(() => {
    if (!isWhistling) {
      whistleScaleY.set(1)
      return
    }
    let rafId: number
    const loop = () => {
      const intensity = getAudioIntensity()
      whistleScaleY.set(1 + intensity * 0.9)
      rafId = requestAnimationFrame(loop)
    }
    rafId = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(rafId)
  }, [isWhistling, whistleScaleY])

  // Velocidad del Arc Reactor según mood
  const arcPulseDuration = mood === 'excited' ? 0.6 : isSleeping ? 4 : 2

  return (
    <motion.div
      className="relative select-none"
      style={{ overflow: 'visible' }}
      animate={{ y: isSleeping ? [0, -5, 0] : mood === 'excited' ? [0, -14, 0] : [0, -10, 0] }}
      transition={{
        duration: isSleeping ? 5 : mood === 'excited' ? 1.8 : 3,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      {/* Halo de fondo */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle, ${eyeColor}22 0%, transparent 70%)`,
          filter: 'blur(20px)',
        }}
        animate={{
          scale: isSleeping ? [1, 1.05, 1] : mood === 'excited' ? [1, 1.35, 1] : [1, 1.15, 1],
          opacity: isSleeping ? [0.15, 0.3, 0.15] : mood === 'excited' ? [0.6, 1, 0.6] : [0.5, 0.9, 0.5],
        }}
        transition={{ duration: isSleeping ? 4 : mood === 'excited' ? 0.8 : 2, repeat: Infinity }}
      />

      {/* Partículas de emoción cuando está excited */}
      {mood === 'excited' && !isSleeping && (
        <>
          {['✦', '★', '✦', '★'].map((star, i) => (
            <motion.span
              key={i}
              style={{
                position: 'absolute',
                fontSize: '10px',
                color: i % 2 === 0 ? '#ff88cc' : '#ffd700',
                pointerEvents: 'none',
                left: `${[10, 75, 20, 65][i]}%`,
                top: `${[15, 10, 60, 55][i]}%`,
              }}
              animate={{
                y: [0, -18, 0],
                opacity: [0, 1, 0],
                scale: [0.5, 1.2, 0.5],
              }}
              transition={{
                duration: 1.2,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            >
              {star}
            </motion.span>
          ))}
        </>
      )}

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
        <path d="M54,92 Q46,115 50,138 Q55,118 62,104Z" fill="#dcdcec" />
        <path d="M146,92 Q154,115 150,138 Q145,118 138,104Z" fill="#dcdcec" />
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
          d={
            isSleeping ? 'M74,88 Q83,86 92,88'
            : mood === 'excited' ? 'M74,80 Q83,74 92,77'
            : mood === 'error' ? 'M74,82 Q83,80 92,85'
            : 'M74,84 Q83,78 92,81'
          }
          stroke="#7a5a4a"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />
        <path
          d={
            isSleeping ? 'M108,88 Q117,86 126,88'
            : mood === 'excited' ? 'M108,77 Q117,74 126,80'
            : mood === 'error' ? 'M108,85 Q117,80 126,82'
            : 'M108,81 Q117,78 126,84'
          }
          stroke="#7a5a4a"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          style={{ transition: 'all 0.6s ease' }}
        />

        {/* === OJOS === */}
        {isSleeping ? (
          <>
            <path d="M72,98 Q83,105 94,98" stroke="#aa8877" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <path d="M106,98 Q117,105 128,98" stroke="#aa8877" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <line x1="77" y1="99" x2="76" y2="103" stroke="#9a7766" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="83" y1="102" x2="83" y2="106" stroke="#9a7766" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="89" y1="99" x2="88" y2="103" stroke="#9a7766" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="111" y1="99" x2="110" y2="103" stroke="#9a7766" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="117" y1="102" x2="117" y2="106" stroke="#9a7766" strokeWidth="1.2" strokeLinecap="round" />
            <line x1="123" y1="99" x2="122" y2="103" stroke="#9a7766" strokeWidth="1.2" strokeLinecap="round" />
          </>
        ) : mood === 'searching' ? (
          /* Ojos escaneando de lado a lado */
          <>
            <ellipse cx="83" cy="97" rx="12" ry="11" fill="#051818" />
            <motion.g
              animate={{ x: [-4, 4, -4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <ellipse cx="83" cy="97" rx="8" ry="9" fill={eyeColor} filter="url(#eyeGlow)" opacity="0.85" />
              <ellipse cx="83" cy="97" rx="4" ry="5" fill="#021212" />
              <circle cx="86" cy="94" r="2.5" fill="white" opacity="0.75" />
            </motion.g>

            <ellipse cx="117" cy="97" rx="12" ry="11" fill="#051818" />
            <motion.g
              animate={{ x: [-4, 4, -4] }}
              transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut', delay: 0.1 }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <ellipse cx="117" cy="97" rx="8" ry="9" fill={eyeColor} filter="url(#eyeGlow)" opacity="0.85" />
              <ellipse cx="117" cy="97" rx="4" ry="5" fill="#021212" />
              <circle cx="120" cy="94" r="2.5" fill="white" opacity="0.75" />
            </motion.g>
          </>
        ) : mood === 'excited' ? (
          /* Ojos grandes con pulso de brillo — sin scale (incompatible con SVG) */
          <>
            <ellipse cx="83" cy="97" rx="13" ry="12" fill="#051818" />
            <motion.ellipse
              cx="83" cy="97" rx="11" ry="10"
              fill={eyeColor}
              filter="url(#eyeGlow)"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.5, repeat: Infinity }}
            />
            <ellipse cx="83" cy="97" rx="5" ry="5" fill="#021212" />
            <circle cx="88" cy="92" r="3.5" fill="white" opacity="0.85" />
            <circle cx="80" cy="101" r="1.5" fill="white" opacity="0.5" />

            <ellipse cx="117" cy="97" rx="13" ry="12" fill="#051818" />
            <motion.ellipse
              cx="117" cy="97" rx="11" ry="10"
              fill={eyeColor}
              filter="url(#eyeGlow)"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 0.5, repeat: Infinity, delay: 0.1 }}
            />
            <ellipse cx="117" cy="97" rx="5" ry="5" fill="#021212" />
            <circle cx="122" cy="92" r="3.5" fill="white" opacity="0.85" />
            <circle cx="114" cy="101" r="1.5" fill="white" opacity="0.5" />
          </>
        ) : (
          <>
            {/* Ojo izquierdo — parpadeo normal */}
            <motion.g
              animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
              transition={{ duration: 5, repeat: Infinity, times: [0, 0.88, 0.92, 0.96, 1] }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <ellipse cx="83" cy="97" rx="12" ry="11" fill="#051818" />
              <ellipse cx="83" cy="97" rx="10" ry="9" fill={eyeColor} filter="url(#eyeGlow)" opacity="0.85" />
              <ellipse cx="83" cy="97" rx="5" ry="5" fill="#021212" />
              <circle cx="87" cy="93" r="3" fill="white" opacity="0.75" />
              <ellipse cx="83" cy="97" rx="12" ry="11" fill="none" stroke={eyeColor} strokeWidth="0.5" opacity="0.4" />
            </motion.g>
            {/* Ojo derecho */}
            <motion.g
              animate={{ scaleY: [1, 1, 0.05, 1, 1] }}
              transition={{ duration: 5, repeat: Infinity, times: [0, 0.88, 0.92, 0.96, 1] }}
              style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
            >
              <ellipse cx="117" cy="97" rx="12" ry="11" fill="#051818" />
              <ellipse cx="117" cy="97" rx="10" ry="9" fill={eyeColor} filter="url(#eyeGlow)" opacity="0.85" />
              <ellipse cx="117" cy="97" rx="5" ry="5" fill="#021212" />
              <circle cx="121" cy="93" r="3" fill="white" opacity="0.75" />
              <ellipse cx="117" cy="97" rx="12" ry="11" fill="none" stroke={eyeColor} strokeWidth="0.5" opacity="0.4" />
            </motion.g>
          </>
        )}

        {/* === NARIZ === */}
        <circle cx="97" cy="115" r="2" fill="#d4956a" opacity="0.6" />
        <circle cx="103" cy="115" r="2" fill="#d4956a" opacity="0.6" />

        {/* === BOCA === */}
        {isSleeping ? (
          <ellipse cx="100" cy="133" rx="5" ry="4" fill="#cc4466" opacity="0.55" />
        ) : isWhistling ? (
          <motion.g style={{ transformBox: 'fill-box', transformOrigin: 'center', scaleY: whistleScaleY }}>
            <ellipse cx="100" cy="130" rx="7" ry="9" fill="#cc4466" />
            <ellipse cx="100" cy="130" rx="4" ry="6" fill="#551133" />
          </motion.g>
        ) : mood === 'excited' ? (
          /* Sonrisa grande con dientes */
          <>
            <path
              d="M83,126 Q100,142 117,126"
              stroke="#d45070"
              strokeWidth="2.5"
              fill="#ff7799"
              fillOpacity="0.3"
              strokeLinecap="round"
            />
            <path d="M88,128 L88,133 M94,130 L94,135 M100,131 L100,136 M106,130 L106,135 M112,128 L112,133"
              stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.7" />
          </>
        ) : mood === 'searching' ? (
          /* Boca pensativa — comisura derecha levantada */
          <path
            d="M88,130 Q100,132 114,127"
            stroke="#d45070"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        ) : mood === 'error' ? (
          /* Boca fruncida */
          <path
            d="M88,134 Q100,128 114,134"
            stroke="#d45070"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
        ) : isSpeaking ? (
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
          <path d="M88,128 Q100,137 114,128" stroke="#d45070" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        )}

        {/* === ZZZ DURMIENDO === */}
        {isSleeping && (
          <>
            <motion.text x="128" y="85" fontSize="11" fill="#8888cc" fontFamily="monospace" fontWeight="bold" textAnchor="middle"
              animate={{ y: [85, 65, 45], opacity: [0.85, 0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0 }}>z</motion.text>
            <motion.text x="143" y="70" fontSize="14" fill="#8888cc" fontFamily="monospace" fontWeight="bold" textAnchor="middle"
              animate={{ y: [70, 50, 30], opacity: [0.85, 0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.85 }}>Z</motion.text>
            <motion.text x="160" y="53" fontSize="17" fill="#8888cc" fontFamily="monospace" fontWeight="bold" textAnchor="middle"
              animate={{ y: [53, 33, 13], opacity: [0.85, 0.5, 0] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 1.7 }}>Z</motion.text>
          </>
        )}

        {/* Notas musicales silbando */}
        {isWhistling && (
          <>
            <motion.text x="118" y="118" fontSize="10" fill="#00ffff" fontFamily="monospace"
              animate={{ y: [118, 100, 82], x: [118, 124, 130], opacity: [0.8, 0.5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0 }}>♪</motion.text>
            <motion.text x="122" y="110" fontSize="13" fill="#ffd700" fontFamily="monospace"
              animate={{ y: [110, 90, 70], x: [122, 130, 138], opacity: [0.8, 0.5, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: 0.6 }}>♫</motion.text>
          </>
        )}

        {/* Lupa cuando está buscando */}
        {mood === 'searching' && !isSleeping && (
          <motion.g
            animate={{ rotate: [-10, 10, -10] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
          >
            <circle cx="142" cy="70" r="9" fill="none" stroke="#ffd700" strokeWidth="2" opacity="0.8" />
            <line x1="148" y1="76" x2="156" y2="84" stroke="#ffd700" strokeWidth="2.5" strokeLinecap="round" opacity="0.8" />
          </motion.g>
        )}

        {/* === CUELLO === */}
        <rect x="88" y="152" width="24" height="22" rx="5" fill="url(#skinGrad)" />

        {/* === TRAJE / CUERPO === */}
        <rect x="44" y="170" width="112" height="100" rx="12" fill="url(#suitGrad)" />
        <rect x="44" y="170" width="32" height="9" rx="4" fill="#cc0000" />
        <rect x="124" y="170" width="32" height="9" rx="4" fill="#cc0000" />
        <rect x="44" y="170" width="112" height="3" rx="1.5" fill="#ffd700" opacity="0.8" />
        <line x1="100" y1="176" x2="100" y2="265" stroke="#ffd700" strokeWidth="1" opacity="0.3" />
        <rect x="52" y="185" width="16" height="3" rx="1.5" fill={eyeColor} opacity="0.5" />
        <rect x="52" y="192" width="12" height="3" rx="1.5" fill={eyeColor} opacity="0.3" />
        <rect x="132" y="185" width="16" height="3" rx="1.5" fill={eyeColor} opacity="0.5" />
        <rect x="136" y="192" width="12" height="3" rx="1.5" fill={eyeColor} opacity="0.3" />

        {/* === ARC REACTOR === */}
        <circle cx="100" cy="208" r="20" fill="#020e18" stroke={arcColor} strokeWidth="2" filter="url(#arcGlow)" />
        <circle cx="100" cy="208" r="15" fill="#020e18" stroke={arcColor} strokeWidth="1.2" opacity="0.7" />
        <polygon points="100,195 113,215 87,215" fill="none" stroke={arcColor} strokeWidth="1.5" opacity="0.8" />
        <motion.circle
          cx="100"
          cy="208"
          r="7"
          fill={arcColor}
          opacity="0.7"
          filter="url(#arcGlow)"
          animate={{
            r: isSleeping ? [5, 6, 5] : mood === 'excited' ? [8, 12, 8] : [7, 9, 7],
            opacity: isSleeping ? [0.25, 0.45, 0.25] : mood === 'excited' ? [0.8, 1, 0.8] : [0.7, 1, 0.7],
          }}
          transition={{ duration: arcPulseDuration, repeat: Infinity }}
        />
        <circle cx="100" cy="208" r="3" fill="white" opacity="0.9" />

        {/* === BADGE SilvIA === */}
        <rect x="70" y="245" width="60" height="22" rx="4" fill="#080815" stroke="#ffd700" strokeWidth="1.5" />
        <text x="100" y="260" textAnchor="middle" fontFamily="'Courier New', monospace" fontSize="10" fill="#ffd700" fontWeight="bold" letterSpacing="1">
          SilvIA
        </text>
      </svg>
    </motion.div>
  )
}
