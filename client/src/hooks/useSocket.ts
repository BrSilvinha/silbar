import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket() {
  const socketRef = useRef<Socket | null>(null)
  const [progress, setProgress] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    socketRef.current = io('http://localhost:3001', {
      transports: ['websocket', 'polling'],
    })

    socketRef.current.on('connect', () => setIsConnected(true))
    socketRef.current.on('disconnect', () => setIsConnected(false))
    socketRef.current.on('progress', (value: number) => setProgress(value))

    return () => {
      socketRef.current?.disconnect()
    }
  }, [])

  const resetProgress = () => setProgress(0)

  return {
    socketId: socketRef.current?.id ?? '',
    progress,
    isConnected,
    resetProgress,
  }
}
