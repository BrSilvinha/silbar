// Utilidad de sonidos via Web Audio API (sin archivos externos)
let _ctx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!_ctx) {
    _ctx = new (window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  if (_ctx.state === 'suspended') _ctx.resume()
  return _ctx
}

function tone(
  frequency: number,
  duration: number,
  volume: number,
  type: OscillatorType = 'sine'
) {
  try {
    const ctx = getCtx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = frequency
    osc.type = type
    gain.gain.setValueAtTime(volume, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + duration)
  } catch {
    // Audio no disponible, falla silenciosamente
  }
}

export const sounds = {
  /** Click de tecla al tipear cada letra */
  typingClick() {
    tone(480 + Math.random() * 280, 0.028, 0.022, 'square')
  },

  /** Arpegio ascendente: descarga exitosa */
  success() {
    ;[523, 659, 784, 1047].forEach((f, i) =>
      setTimeout(() => tone(f, 0.18, 0.07, 'sine'), i * 100)
    )
  },

  /** Buzz descendente: error */
  error() {
    tone(220, 0.22, 0.07, 'sawtooth')
    setTimeout(() => tone(170, 0.28, 0.055, 'sawtooth'), 200)
  },

  /** Beep corto: analizando */
  analyzing() {
    tone(880, 0.055, 0.04, 'square')
    setTimeout(() => tone(1100, 0.04, 0.03, 'square'), 80)
  },

  /** Secuencia ascendente: inicio de descarga */
  downloadStart() {
    ;[440, 554, 659].forEach((f, i) =>
      setTimeout(() => tone(f, 0.1, 0.055, 'sine'), i * 75)
    )
  },

  /** Clic suave: toggle de tema */
  toggle() {
    tone(660, 0.07, 0.035, 'sine')
    setTimeout(() => tone(880, 0.06, 0.025, 'sine'), 60)
  },

  /** URL de YouTube detectada */
  urlDetected() {
    tone(1200, 0.04, 0.03, 'square')
  },
}
