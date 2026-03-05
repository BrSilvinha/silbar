import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PopularSong {
  title: string
  author: string
  thumbnail: string
  count: number
  url?: string
}

const API = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export function PopularSongs({ onDownload }: { onDownload?: (url: string) => void }) {
  const [songs, setSongs] = useState<PopularSong[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPopular = async () => {
      try {
        const res = await fetch(`${API}/api/popular`)
        if (res.ok) {
          const data = await res.json()
          setSongs(data)
        }
      } catch {
        // servidor no disponible, ignorar
      } finally {
        setLoading(false)
      }
    }

    fetchPopular()
    const interval = setInterval(fetchPopular, 30_000)
    return () => clearInterval(interval)
  }, [])

  const maxCount = songs.length > 0 ? Math.max(...songs.map(s => s.count)) : 1

  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: 'linear-gradient(135deg, #030f0a 0%, #041208 100%)',
        border: '1px solid rgba(0,255,136,0.15)',
        boxShadow: '0 0 20px rgba(0,255,136,0.04)',
      }}
    >
      {/* Header */}
      <div
        style={{
          fontFamily: 'Orbitron, monospace',
          fontSize: '7px',
          color: '#00ff88',
          letterSpacing: '2px',
          marginBottom: '10px',
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          opacity: 0.85,
        }}
      >
        {/* Indicador pulsante */}
        <motion.div
          style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#00ff88', flexShrink: 0 }}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
        MAS_ESCUCHADO_HOY
      </div>

      {loading ? (
        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: '10px',
            color: '#00ff8844',
            textAlign: 'center',
            padding: '12px 0',
          }}
        >
          cargando...
        </div>
      ) : songs.length === 0 ? (
        <div
          style={{
            fontFamily: '"Courier New", monospace',
            fontSize: '9px',
            color: '#00ff8833',
            textAlign: 'center',
            padding: '12px 0',
            lineHeight: '1.7',
          }}
        >
          sin descargas aún
          <br />
          <span style={{ fontSize: '8px' }}>sé el primero</span>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
          <AnimatePresence>
            {songs.map((song, i) => (
              <motion.div
                key={song.title}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.25, delay: i * 0.04 }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '7px',
                    padding: '5px 6px',
                    borderRadius: '6px',
                    background: i === 0 ? 'rgba(0,255,136,0.06)' : 'transparent',
                  }}
                >
                  {/* Rank */}
                  <span
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '8px',
                      color: i === 0 ? '#00ff88' : i === 1 ? '#00cc6a' : '#006633',
                      minWidth: '12px',
                      textAlign: 'center',
                      fontWeight: 'bold',
                    }}
                  >
                    {i + 1}
                  </span>

                  {/* Thumbnail */}
                  {song.thumbnail ? (
                    <img
                      src={song.thumbnail}
                      alt={song.title}
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '4px',
                        objectFit: 'cover',
                        flexShrink: 0,
                        border: `1px solid ${i === 0 ? 'rgba(0,255,136,0.3)' : 'rgba(0,255,136,0.08)'}`,
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '4px',
                        background: '#041208',
                        border: '1px solid rgba(0,255,136,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        fontSize: '10px',
                        color: '#00ff8833',
                      }}
                    >
                      #
                    </div>
                  )}

                  {/* Info + barra de popularidad */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p
                      style={{
                        fontFamily: '"Courier New", monospace',
                        fontSize: '9px',
                        color: i === 0 ? '#00ff88' : '#00cc6a88',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginBottom: '3px',
                      }}
                    >
                      {song.title}
                    </p>
                    {/* Barra de popularidad relativa */}
                    <div style={{ width: '100%', height: '2px', background: 'rgba(0,255,136,0.08)', borderRadius: '1px' }}>
                      <motion.div
                        style={{ height: '100%', borderRadius: '1px', background: i === 0 ? '#00ff88' : '#00aa55' }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(song.count / maxCount) * 100}%` }}
                        transition={{ duration: 0.6, delay: i * 0.08 }}
                      />
                    </div>
                  </div>

                  {/* Count */}
                  <span
                    style={{
                      fontFamily: 'Orbitron, monospace',
                      fontSize: '7px',
                      color: i === 0 ? '#00ff88' : '#00553322',
                      flexShrink: 0,
                    }}
                  >
                    x{song.count}
                  </span>

                  {/* Botón descarga directa */}
                  {song.url && onDownload && (
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); onDownload(song.url!) }}
                      whileHover={{ scale: 1.12 }}
                      whileTap={{ scale: 0.88 }}
                      title="Descargar esta canción"
                      style={{
                        flexShrink: 0,
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        border: '1px solid rgba(0,255,136,0.3)',
                        background: 'rgba(0,255,136,0.08)',
                        color: '#00ff88',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                        <path d="M4.5,1 L4.5,6 M2,4.5 L4.5,7 L7,4.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </motion.button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}
