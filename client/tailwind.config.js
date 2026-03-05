/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'neon-cyan': '#00ffff',
        'neon-green': '#00ff88',
        'iron-red': '#cc0000',
        'iron-gold': '#ffd700',
        'dark-bg': '#05050f',
        'dark-card': '#0d0d1e',
        'dark-border': '#1a1a3e',
      },
      fontFamily: {
        retro: ['"Press Start 2P"', 'monospace'],
        tech: ['Orbitron', 'monospace'],
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        blink: 'blink 5s ease-in-out infinite',
        glitch: 'glitch 0.4s ease-in-out',
        scanline: 'scanline 6s linear infinite',
        'arc-spin': 'arcSpin 4s linear infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', filter: 'brightness(1)' },
          '50%': { opacity: '1', filter: 'brightness(1.4)' },
        },
        blink: {
          '0%, 88%, 100%': { transform: 'scaleY(1)' },
          '92%': { transform: 'scaleY(0.05)' },
        },
        glitch: {
          '0%': { transform: 'translate(0,0)', filter: 'none' },
          '20%': { transform: 'translate(-3px,2px)', filter: 'hue-rotate(90deg)' },
          '40%': { transform: 'translate(3px,-2px)', filter: 'hue-rotate(-90deg)' },
          '60%': { transform: 'translate(-2px,3px)', filter: 'hue-rotate(45deg)' },
          '80%': { transform: 'translate(2px,-1px)', filter: 'none' },
          '100%': { transform: 'translate(0,0)', filter: 'none' },
        },
        scanline: {
          '0%': { top: '-5%' },
          '100%': { top: '105%' },
        },
        arcSpin: {
          '0%': { strokeDashoffset: '0' },
          '100%': { strokeDashoffset: '-283' },
        },
      },
      boxShadow: {
        'neon-cyan': '0 0 10px #00ffff, 0 0 20px #00ffff44',
        'neon-red': '0 0 10px #cc0000, 0 0 20px #cc000044',
        'neon-gold': '0 0 10px #ffd700, 0 0 20px #ffd70044',
      },
    },
  },
  plugins: [],
}
