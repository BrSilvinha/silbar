import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAudioPlayer } from '../hooks/useAudioPlayer'
import { HistoryItem } from './History'

interface NowPlayingProps {
  song: HistoryItem | null
  onToggleReady?: (fn: () => void) => void
  onSongEnded?: () => void
  onNext?: () => void
  onPrev?: () => void
  hasPrev?: boolean
  hasNext?: boolean
  isLoadingPlayback?: boolean
  isPlaylist?: boolean
  playlistPosition?: string
}

function fmtTime(s: number): string {
  if (!isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

function PlayIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <polygon points="3,1 13,7 3,13" fill="currentColor" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="2" y="1" width="4" height="12" rx="1" fill="currentColor" />
      <rect x="8" y="1" width="4" height="12" rx="1" fill="currentColor" />
    </svg>
  )
}

function PrevIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="1" y="1" width="2" height="11" rx="1" fill="currentColor" />
      <polygon points="11,1 4,6.5 11,12" fill="currentColor" />
    </svg>
  )
}

function NextIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
      <rect x="10" y="1" width="2" height="11" rx="1" fill="currentColor" />
      <polygon points="2,1 9,6.5 2,12" fill="currentColor" />
    </svg>
  )
}

function VolumeIcon({ volume }: { volume: number }) {
  if (volume === 0) return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2,5 L5,5 L8,2 L8,12 L5,9 L2,9 Z" fill="currentColor" opacity="0.4" />
      <line x1="10" y1="5" x2="13" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="13" y1="5" x2="10" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
  if (volume < 0.5) return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2,5 L5,5 L8,2 L8,12 L5,9 L2,9 Z" fill="currentColor" />
      <path d="M9.5,5 Q11,7 9.5,9" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    </svg>
  )
  return (
    <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
      <path d="M2,5 L5,5 L8,2 L8,12 L5,9 L2,9 Z" fill="currentColor" />
      <path d="M9.5,4 Q12,7 9.5,10" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M11,2.5 Q14.5,7 11,11.5" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.6" />
    </svg>
  )
}

export function NowPlaying({
  song,
  onToggleReady,
  onSongEnded,
  onNext,
  onPrev,
  hasPrev,
  hasNext,
  isLoadingPlayback,
  isPlaylist,
  playlistPosition,
}: NowPlayingProps) {
  const { audioRef, isPlaying, currentTime, duration, toggle, seek, volume, setVolume, play } =
    useAudioPlayer(song?.audioUrl, onSongEnded)
  const [muted, setMuted] = useState(false)
  const prevVolumeRef = useRef(volume)

  // Exponer toggle al padre para shortcuts de teclado
  useEffect(() => {
    onToggleReady?.(toggle)
  }, [toggle, onToggleReady])

  // Auto-play cuando llega un audioUrl (descarga completada o nueva canción)
  useEffect(() => {
    if (song?.audioUrl) play()
  }, [song?.audioUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleMuteToggle = () => {
    if (muted) {
      setMuted(false)
      setVolume(prevVolumeRef.current > 0 ? prevVolumeRef.current : 0.8)
    } else {
      prevVolumeRef.current = volume
      setMuted(true)
      setVolume(0)
    }
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = (e.clientX - rect.left) / rect.width
    seek(ratio * duration)
  }

  const ctrlBtn: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: '1px solid #ffd70033',
    background: 'rgba(255,215,0,0.05)',
    color: '#ffd700',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'all 0.2s',
  }

  return (
    <div
      className="rounded-xl p-4 panel-theme"
      style={{
        background: 'linear-gradient(135deg, var(--bg-surface) 0%, var(--bg-panel) 100%)',
        border: song ? '1px solid #ffd70033' : '1px solid var(--border)',
        overflow: 'hidden',
        transition: 'border-color 0.4s',
        position: 'relative',
      }}
    >
      {/* Loading overlay cuando se re-descarga silenciosamente */}
      <AnimatePresence>
        {isLoadingPlayback && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(5,5,15,0.82)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              zIndex: 10,
              borderRadius: '12px',
            }}
          >
            <motion.div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                border: '2px solid #ffd700',
                borderTopColor: 'transparent',
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}
            />
            <span style={{ fontFamily: 'Orbitron, monospace', fontSize: '8px', color: '#ffd700', letterSpacing: '1px' }}>
              CARGANDO...
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div
        style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: '8px',
          color: '#ffd700',
          letterSpacing: '2px',
          marginBottom: '12px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
        }}
      >
        {song && (
          <motion.span
            animate={{ opacity: isPlaying ? [1, 0.3, 1] : 1 }}
            transition={{ duration: 1.2, repeat: isPlaying ? Infinity : 0 }}
            style={{ color: isPlaying ? '#00ff88' : '#ffd700', fontSize: '10px' }}
          >
            ●
          </motion.span>
        )}
        NOW_PLAYING
        {playlistPosition && (
          <span style={{ marginLeft: 'auto', color: '#ffd70066', fontSize: '7px' }}>
            {playlistPosition}
          </span>
        )}
      </div>

      {/* Elemento audio oculto */}
      {song?.audioUrl && (
        <audio ref={audioRef} src={song.audioUrl} preload="metadata" style={{ display: 'none' }} />
      )}

      <AnimatePresence mode="wait">
        {song ? (
          <motion.div
            key={song.id ?? song.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {/* Fila: vinyl + info */}
            <div className="flex items-center gap-3 mb-3">
              {/* Disco de vinilo */}
              <div className="relative shrink-0" style={{ width: '72px', height: '72px' }}>
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 50%, #1a1a1a 0%, #2a2a2a 40%, #111 70%, #0a0a0a 100%)',
                    border: '2px solid #333',
                    boxShadow: isPlaying ? '0 0 16px #ffd70033' : '0 0 6px #00000066',
                  }}
                  animate={{ rotate: isPlaying ? 360 : 0 }}
                  transition={
                    isPlaying
                      ? { duration: 3, repeat: Infinity, ease: 'linear' }
                      : { duration: 0.4, ease: 'easeOut' }
                  }
                >
                  {/* Surcos */}
                  {[28, 38, 48].map((r) => (
                    <div
                      key={r}
                      className="absolute rounded-full"
                      style={{ inset: `${r}%`, border: '1px solid rgba(255,255,255,0.04)' }}
                    />
                  ))}
                  {/* Thumbnail en el centro */}
                  <div
                    className="absolute rounded-full overflow-hidden"
                    style={{ inset: '22%', border: '1px solid #555' }}
                  >
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  {/* Agujero central */}
                  <div
                    className="absolute rounded-full"
                    style={{ inset: '44%', background: '#050510', border: '1px solid #444' }}
                  />
                </motion.div>

                {/* Aguja */}
                <motion.div
                  style={{
                    position: 'absolute',
                    top: '2px',
                    right: '-5px',
                    width: '3px',
                    height: '26px',
                    background: 'linear-gradient(180deg, #ffd700 0%, #997700 100%)',
                    borderRadius: '2px 2px 0 0',
                    transformOrigin: 'top center',
                  }}
                  animate={{ rotate: isPlaying ? 22 : 8 }}
                  transition={{ duration: 0.4, ease: 'easeInOut' }}
                />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p
                  className="truncate font-bold"
                  style={{
                    fontFamily: 'Orbitron, monospace',
                    fontSize: '10px',
                    color: '#ffd700',
                    marginBottom: '3px',
                  }}
                >
                  {song.title}
                </p>
                <p
                  className="truncate"
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                  }}
                >
                  {song.author}
                </p>

                {/* Controles: prev + play/pause + next */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px' }}>
                  {/* Prev (solo en modo playlist) */}
                  {isPlaylist && (
                    <motion.button
                      onClick={onPrev}
                      disabled={!hasPrev}
                      whileTap={{ scale: 0.88 }}
                      style={{ ...ctrlBtn, opacity: hasPrev ? 1 : 0.3 }}
                      title="Anterior"
                    >
                      <PrevIcon />
                    </motion.button>
                  )}

                  {/* Play/Pause (solo si hay audioUrl) */}
                  {song.audioUrl && (
                    <motion.button
                      onClick={toggle}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        border: `1px solid ${isPlaying ? '#00ff8844' : '#ffd70044'}`,
                        background: isPlaying ? 'rgba(0,255,136,0.08)' : 'rgba(255,215,0,0.06)',
                        color: isPlaying ? '#00ff88' : '#ffd700',
                        cursor: 'pointer',
                        boxShadow: isPlaying ? '0 0 10px #00ff8833' : 'none',
                        transition: 'all 0.3s',
                      }}
                    >
                      {isPlaying ? <PauseIcon /> : <PlayIcon />}
                    </motion.button>
                  )}

                  {/* Next (solo en modo playlist) */}
                  {isPlaylist && (
                    <motion.button
                      onClick={onNext}
                      disabled={!hasNext}
                      whileTap={{ scale: 0.88 }}
                      style={{ ...ctrlBtn, opacity: hasNext ? 1 : 0.3 }}
                      title="Siguiente"
                    >
                      <NextIcon />
                    </motion.button>
                  )}
                </div>
              </div>
            </div>

            {/* Barra de progreso (solo con audioUrl) */}
            {song.audioUrl ? (
              <div>
                {/* Track clicable */}
                <div
                  onClick={handleProgressClick}
                  style={{
                    cursor: 'pointer',
                    height: '5px',
                    background: 'var(--border)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    marginBottom: '4px',
                  }}
                >
                  <motion.div
                    style={{
                      height: '100%',
                      background: 'linear-gradient(90deg, #cc0000, #ffd700, #00ffff)',
                      boxShadow: '0 0 6px #ffd70066',
                      transformOrigin: 'left',
                    }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.25, ease: 'linear' }}
                  />
                </div>
                {/* Tiempos */}
                <div
                  className="flex justify-between"
                  style={{
                    fontFamily: '"Courier New", monospace',
                    fontSize: '9px',
                    color: 'var(--text-muted)',
                    marginBottom: '8px',
                  }}
                >
                  <span>{fmtTime(currentTime)}</span>
                  <span>{fmtTime(duration)}</span>
                </div>

                {/* Control de volumen */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <motion.button
                    onClick={handleMuteToggle}
                    whileTap={{ scale: 0.85 }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      color: muted ? '#ff444488' : 'var(--text-muted)',
                      padding: '2px',
                      display: 'flex',
                      alignItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <VolumeIcon volume={muted ? 0 : volume} />
                  </motion.button>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.02}
                    value={muted ? 0 : volume}
                    onChange={e => {
                      const v = parseFloat(e.target.value)
                      if (muted && v > 0) setMuted(false)
                      setVolume(v)
                    }}
                    style={{
                      flex: 1,
                      height: '3px',
                      accentColor: '#ffd700',
                      cursor: 'pointer',
                      opacity: 0.7,
                    }}
                  />
                </div>
              </div>
            ) : (
              /* Sin audioUrl: indicador de que está en historial sin URL */
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div
                  className="w-full rounded-full overflow-hidden"
                  style={{ height: '3px', background: 'var(--border)' }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #cc0000, #ffd700, #00ffff)' }}
                    animate={{ x: ['-100%', '0%'] }}
                    transition={{ duration: 40, ease: 'linear', repeat: Infinity }}
                  />
                </div>
                <p style={{ fontFamily: '"Courier New", monospace', fontSize: '9px', color: 'var(--text-subtle)', textAlign: 'center', marginTop: '4px' }}>
                  Click ▶ en historial para reproducir
                </p>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-3"
          >
            <div
              className="shrink-0 rounded-full flex items-center justify-center"
              style={{
                width: '52px',
                height: '52px',
                background: 'var(--bg-panel)',
                border: '2px solid var(--border)',
              }}
            >
              <span style={{ fontSize: '20px', color: 'var(--text-muted)', opacity: 0.4 }}>♪</span>
            </div>
            <div>
              <p
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '10px',
                  color: 'var(--text-muted)',
                  marginBottom: '3px',
                }}
              >
                Sin reproduccion
              </p>
              <p
                style={{
                  fontFamily: '"Courier New", monospace',
                  fontSize: '10px',
                  color: 'var(--text-subtle)',
                }}
              >
                Descarga algo primero
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
