import { useState, useRef, useCallback, useEffect } from 'react'
import { setGlobalAnalyser } from '../utils/audioStore'

export interface AudioPlayerReturn {
  audioRef: React.RefObject<HTMLAudioElement>
  isPlaying: boolean
  currentTime: number
  duration: number
  volume: number
  setVolume: (v: number) => void
  play: () => Promise<void>
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
}

export function useAudioPlayer(audioUrl: string | undefined, onEnded?: () => void): AudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceCreatedRef = useRef(false)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolumeState] = useState<number>(() => {
    try { return parseFloat(localStorage.getItem('silbar-volume') || '0.8') } catch { return 0.8 }
  })

  const setVolume = useCallback((v: number) => {
    const clamped = Math.max(0, Math.min(1, v))
    setVolumeState(clamped)
    if (audioRef.current) audioRef.current.volume = clamped
    try { localStorage.setItem('silbar-volume', String(clamped)) } catch {}
  }, [])

  // Aplicar volumen inicial cuando el elemento de audio esté listo
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume
  }, [audioUrl]) // eslint-disable-line react-hooks/exhaustive-deps

  // Crea AudioContext + AnalyserNode solo una vez por elemento <audio>
  const setupAudioContext = useCallback(() => {
    const audio = audioRef.current
    if (!audio || sourceCreatedRef.current) return
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
      const ctx = new AudioCtx()
      const source = ctx.createMediaElementSource(audio)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 64
      analyser.smoothingTimeConstant = 0.8
      source.connect(analyser)
      analyser.connect(ctx.destination)
      audioCtxRef.current = ctx
      analyserRef.current = analyser
      sourceCreatedRef.current = true
    } catch (e) {
      console.warn('AudioContext setup failed:', e)
    }
  }, [])

  const play = useCallback(async () => {
    const audio = audioRef.current
    if (!audio) return
    setupAudioContext()
    // Siempre re-exponer el analyser al store al reproducir
    if (analyserRef.current) setGlobalAnalyser(analyserRef.current)
    try {
      if (audioCtxRef.current?.state === 'suspended') {
        await audioCtxRef.current.resume()
      }
      await audio.play()
      setIsPlaying(true)
    } catch (e) {
      console.error('Play failed:', e)
    }
  }, [setupAudioContext])

  const pause = useCallback(() => {
    audioRef.current?.pause()
    setIsPlaying(false)
    setGlobalAnalyser(null) // Detener visualizador al pausar
  }, [])

  const toggle = useCallback(() => {
    if (isPlaying) pause()
    else play()
  }, [isPlaying, play, pause])

  const seek = useCallback((time: number) => {
    const audio = audioRef.current
    if (!audio) return
    const clamped = Math.max(0, Math.min(time, audio.duration || 0))
    audio.currentTime = clamped
    setCurrentTime(clamped)
  }, [])

  // Eventos del elemento audio
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const onMeta = () => setDuration(audio.duration || 0)
    const onTime = () => setCurrentTime(audio.currentTime)
    const onEndedHandler = () => { setIsPlaying(false); setGlobalAnalyser(null); onEnded?.() }
    audio.addEventListener('loadedmetadata', onMeta)
    audio.addEventListener('timeupdate', onTime)
    audio.addEventListener('ended', onEndedHandler)
    return () => {
      audio.removeEventListener('loadedmetadata', onMeta)
      audio.removeEventListener('timeupdate', onTime)
      audio.removeEventListener('ended', onEndedHandler)
    }
  }, [audioUrl])

  // Al cambiar la URL: detener y resetear estado (sin tocar AudioContext)
  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.pause()
      audio.currentTime = 0
    }
    setIsPlaying(false)
    setCurrentTime(0)
    setDuration(0)
    setGlobalAnalyser(null)
    // Si no hay URL, liberar el AudioContext para que la proxima cancion
    // pueda crear un nuevo MediaElementAudioSourceNode en un elemento nuevo
    if (!audioUrl) {
      audioCtxRef.current?.close()
      audioCtxRef.current = null
      analyserRef.current = null
      sourceCreatedRef.current = false
    }
  }, [audioUrl])

  // Limpieza al desmontar
  useEffect(() => {
    return () => {
      setGlobalAnalyser(null)
      audioCtxRef.current?.close()
    }
  }, [])

  return { audioRef, isPlaying, currentTime, duration, volume, setVolume, play, pause, toggle, seek }
}
