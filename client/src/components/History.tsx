import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export interface HistoryItem {
  id: string
  title: string
  author: string
  thumbnail: string
  downloadedAt: Date
  audioUrl?: string
  sourceUrl?: string
}

interface HistoryProps {
  items: HistoryItem[]
  currentSongId?: string
  onPlaySingle?: (item: HistoryItem) => void
  onPlayAll?: (items: HistoryItem[]) => void
  onShuffle?: (items: HistoryItem[]) => void
}

const btnStyle: React.CSSProperties = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '7px',
  letterSpacing: '1px',
  padding: '3px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  border: '1px solid #ffd70044',
  background: 'rgba(255,215,0,0.06)',
  color: '#ffd700',
  whiteSpace: 'nowrap' as const,
  transition: 'all 0.2s',
}

const clearBtnStyle: React.CSSProperties = {
  fontFamily: 'Orbitron, monospace',
  fontSize: '7px',
  letterSpacing: '1px',
  padding: '3px 8px',
  borderRadius: '4px',
  cursor: 'pointer',
  border: '1px solid #cc000044',
  background: 'rgba(204,0,0,0.06)',
  color: '#ff6666',
  whiteSpace: 'nowrap' as const,
  transition: 'all 0.2s',
}

export function History({ items, currentSongId, onPlaySingle, onPlayAll, onShuffle }: HistoryProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  if (items.length === 0) return null

  const toggleSelect = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const clearSelection = () => setSelectedIds(new Set())

  const selectedItems = items.filter(item => selectedIds.has(item.id))
  const playItems = selectedItems.length > 0 ? selectedItems : items

  return (
    <div className="mt-8">
      {/* Header estilo arcade */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, #cc0000, transparent)' }} />
        <h2
          style={{
            fontFamily: '"Press Start 2P", monospace',
            fontSize: '10px',
            color: '#ffd700',
            letterSpacing: '2px',
            textShadow: '0 0 10px #ffd70088',
            whiteSpace: 'nowrap',
          }}
        >
          HISTORIAL
        </h2>

        {/* Botones de acción (solo si hay 2+ canciones) */}
        {items.length > 1 && (
          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {selectedItems.length > 0 && (
              <motion.button
                onClick={clearSelection}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={clearBtnStyle}
                title="Limpiar selección"
              >
                X ({selectedItems.length})
              </motion.button>
            )}
            <motion.button
              onClick={() => onPlayAll?.(playItems)}
              whileHover={{ scale: 1.05, background: 'rgba(255,215,0,0.14)' }}
              whileTap={{ scale: 0.95 }}
              style={btnStyle}
              title={selectedItems.length > 0 ? 'Reproducir seleccionadas en orden' : 'Reproducir todo en orden'}
            >
              {selectedItems.length > 0 ? `PLAY (${selectedItems.length})` : 'PLAY TODO'}
            </motion.button>
            <motion.button
              onClick={() => onShuffle?.(playItems)}
              whileHover={{ scale: 1.05, background: 'rgba(255,215,0,0.14)' }}
              whileTap={{ scale: 0.95 }}
              style={btnStyle}
              title={selectedItems.length > 0 ? 'Reproducir seleccionadas en aleatorio' : 'Reproducir en aleatorio'}
            >
              ALEA
            </motion.button>
          </div>
        )}

        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #cc0000)' }} />
      </div>

      {/* Tabla */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: '1px solid #1a1a4a',
          background: '#080815',
        }}
      >
        {/* Header de tabla */}
        <div
          className="flex items-center gap-2 px-4 py-2"
          style={{
            background: '#0d0d2a',
            borderBottom: '1px solid #1a1a4a',
          }}
        >
          <div style={{ width: '18px', flexShrink: 0 }} />
          <span style={{ width: '28px', flexShrink: 0, fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#555', textAlign: 'center' }}>#</span>
          <span style={{ flex: 1, fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#555' }}>CANCION</span>
          <span style={{ width: '70px', flexShrink: 0, fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#555', textAlign: 'right' }}>HORA</span>
        </div>

        <div className="divide-y divide-gray-900">
          <AnimatePresence>
            {items.map((item, index) => {
              const isActive = item.id === currentSongId
              const isSelected = selectedIds.has(item.id)
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onPlaySingle?.(item)}
                  className="flex items-center gap-2 px-4 py-3"
                  style={{
                    cursor: onPlaySingle ? 'pointer' : 'default',
                    background: isSelected
                      ? 'rgba(255,215,0,0.10)'
                      : isActive
                      ? 'rgba(255,215,0,0.06)'
                      : undefined,
                    borderLeft: isActive ? '2px solid #ffd700' : '2px solid transparent',
                    transition: 'background 0.15s',
                  }}
                >
                  {/* Checkbox */}
                  <div
                    onClick={(e) => toggleSelect(item.id, e)}
                    style={{
                      width: '14px',
                      height: '14px',
                      flexShrink: 0,
                      borderRadius: '3px',
                      border: isSelected ? '1.5px solid #ffd700' : '1.5px solid #333',
                      background: isSelected ? 'rgba(255,215,0,0.2)' : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {isSelected && (
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <polyline points="1,4 3,6 7,2" stroke="#ffd700" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>

                  {/* Número */}
                  <span
                    style={{
                      width: '28px',
                      flexShrink: 0,
                      textAlign: 'center',
                      fontFamily: '"Press Start 2P"',
                      fontSize: '9px',
                      color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#444',
                    }}
                  >
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {/* Info canción */}
                  <div className="flex items-center gap-3 min-w-0" style={{ flex: 1 }}>
                    <div className="relative shrink-0">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="w-8 h-8 rounded object-cover"
                        style={{ border: `1px solid ${isActive ? '#ffd70066' : '#1a1a4a'}` }}
                      />
                      {isActive && (
                        <div style={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: '4px',
                          background: 'rgba(255,215,0,0.12)',
                          display: 'flex',
                          alignItems: 'flex-end',
                          justifyContent: 'center',
                          gap: '2px',
                          padding: '4px 5px',
                        }}>
                          {[0, 1, 2].map(i => (
                            <motion.div
                              key={i}
                              style={{ width: '3px', background: '#ffd700', borderRadius: '1px' }}
                              animate={{ height: ['3px', '10px', '3px'] }}
                              transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.2 }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p
                        className="truncate text-xs font-bold"
                        style={{ color: isActive ? '#ffd700' : isSelected ? '#ffe88a' : '#c8fff8', fontFamily: '"Courier New", monospace' }}
                      >
                        {item.title}
                      </p>
                      <p
                        className="truncate"
                        style={{ fontSize: '10px', color: '#555', fontFamily: '"Courier New", monospace' }}
                      >
                        {item.author}
                      </p>
                    </div>
                  </div>

                  {/* Hora */}
                  <span
                    style={{
                      width: '70px',
                      flexShrink: 0,
                      textAlign: 'right',
                      fontFamily: '"Courier New", monospace',
                      fontSize: '10px',
                      color: '#00ffff66',
                    }}
                  >
                    {new Date(item.downloadedAt).toLocaleTimeString('es-PE', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Hint de selección */}
      {items.length > 1 && selectedItems.length === 0 && (
        <p style={{ fontFamily: '"Courier New", monospace', fontSize: '9px', color: '#2a2a4a', textAlign: 'center', marginTop: '8px' }}>
          marca canciones para crear tu propia lista
        </p>
      )}
    </div>
  )
}
