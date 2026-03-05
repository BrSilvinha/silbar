/**
 * Singleton global para compartir el AnalyserNode entre componentes
 * sin necesidad de props drilling ni React context.
 * Se actualiza directo, sin re-renders.
 */
let _analyser: AnalyserNode | null = null

export function setGlobalAnalyser(node: AnalyserNode | null): void {
  _analyser = node
}

export function getGlobalAnalyser(): AnalyserNode | null {
  return _analyser
}

/** Devuelve N barras de frecuencia normalizadas (0–100) */
export function getFrequencyBars(numBars: number): number[] {
  if (!_analyser) return Array(numBars).fill(0)
  const data = new Uint8Array(_analyser.frequencyBinCount)
  _analyser.getByteFrequencyData(data)
  const binsPerBar = Math.floor(data.length / numBars)
  return Array.from({ length: numBars }, (_, i) => {
    const start = i * binsPerBar
    const slice = data.slice(start, start + binsPerBar)
    const avg = slice.reduce((s, v) => s + v, 0) / slice.length
    return (avg / 255) * 100
  })
}

/** Intensidad global (0–1) de todo el espectro */
export function getAudioIntensity(): number {
  if (!_analyser) return 0
  const data = new Uint8Array(_analyser.frequencyBinCount)
  _analyser.getByteFrequencyData(data)
  return data.reduce((s, v) => s + v, 0) / data.length / 255
}
