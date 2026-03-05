import { motion, AnimatePresence } from 'framer-motion'

export interface HistoryItem {
  id: string
  title: string
  author: string
  thumbnail: string
  downloadedAt: Date
}

interface HistoryProps {
  items: HistoryItem[]
}

export function History({ items }: HistoryProps) {
  if (items.length === 0) return null

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
          }}
        >
          HISTORIAL
        </h2>
        <div className="flex-1 h-px" style={{ background: 'linear-gradient(90deg, transparent, #cc0000)' }} />
      </div>

      {/* Tabla estilo leaderboard */}
      <div
        className="rounded-xl overflow-hidden"
        style={{
          border: '1px solid #1a1a4a',
          background: '#080815',
        }}
      >
        {/* Header de tabla */}
        <div
          className="grid grid-cols-12 gap-2 px-4 py-2"
          style={{
            background: '#0d0d2a',
            borderBottom: '1px solid #1a1a4a',
          }}
        >
          <span className="col-span-1 text-center" style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#555' }}>#</span>
          <span className="col-span-7" style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#555' }}>CANCION</span>
          <span className="col-span-4 text-right" style={{ fontFamily: '"Press Start 2P"', fontSize: '8px', color: '#555' }}>HORA</span>
        </div>

        <div className="divide-y divide-gray-900">
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-12 gap-2 items-center px-4 py-3 hover:bg-white/5 transition-colors"
              >
                {/* Número */}
                <span
                  className="col-span-1 text-center font-bold"
                  style={{
                    fontFamily: '"Press Start 2P"',
                    fontSize: '9px',
                    color: index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#444',
                  }}
                >
                  {String(index + 1).padStart(2, '0')}
                </span>

                {/* Info canción */}
                <div className="col-span-7 flex items-center gap-3 min-w-0">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-8 h-8 rounded object-cover shrink-0"
                    style={{ border: '1px solid #1a1a4a' }}
                  />
                  <div className="min-w-0">
                    <p
                      className="truncate text-xs font-bold"
                      style={{ color: '#c8fff8', fontFamily: '"Courier New", monospace' }}
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
                  className="col-span-4 text-right"
                  style={{
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
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
