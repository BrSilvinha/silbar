import { useEffect, useState } from 'react'
import { io, Socket } from 'socket.io-client'

// Singleton: el socket vive fuera del componente para sobrevivir al
// doble-montado de React StrictMode en desarrollo
let _socket: Socket | null = null

function getSocket(): Socket {
  if (!_socket) {
    _socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    })
  }
  return _socket
}

export function useSocket() {
  const [progress, setProgress] = useState(0)
  const [isConnected, setIsConnected] = useState(false)
  const [socketId, setSocketId] = useState('')

  useEffect(() => {
    const socket = getSocket()

    const onConnect = () => {
      setIsConnected(true)
      setSocketId(socket.id ?? '')
    }
    const onDisconnect = () => {
      setIsConnected(false)
    }
    const onProgress = (value: number) => {
      setProgress(value)
    }

    socket.on('connect', onConnect)
    socket.on('disconnect', onDisconnect)
    socket.on('progress', onProgress)

    // Si ya estaba conectado cuando se monta el componente
    if (socket.connected) {
      setIsConnected(true)
      setSocketId(socket.id ?? '')
    }

    return () => {
      // Solo removemos los listeners, NO desconectamos el socket
      // Esto evita el problema de StrictMode (doble mount/unmount)
      socket.off('connect', onConnect)
      socket.off('disconnect', onDisconnect)
      socket.off('progress', onProgress)
    }
  }, [])

  const resetProgress = () => setProgress(0)

  return { socketId, progress, isConnected, resetProgress }
}
