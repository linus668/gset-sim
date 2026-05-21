/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['"Fira Code"', '"Cascadia Code"', 'Consolas', 'monospace'],
        display: ['"DM Sans"', 'sans-serif'],
      },
      colors: {
        terminal: {
          bg: '#080c10',
          panel: '#0d1117',
          border: '#1a2332',
          accent: '#00d4ff',
          green: '#00ff88',
          red: '#ff3d5a',
          amber: '#ffb700',
          muted: '#3d5068',
          text: '#8ba7c7',
          bright: '#c9ddf0',
        }
      },
      animation: {
        'pulse-fast': 'pulse 0.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flash-green': 'flashGreen 0.3s ease-out',
        'flash-red': 'flashRed 0.3s ease-out',
        'scanline': 'scanline 4s linear infinite',
      },
      keyframes: {
        flashGreen: {
          '0%': { backgroundColor: 'rgba(0, 255, 136, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        flashRed: {
          '0%': { backgroundColor: 'rgba(255, 61, 90, 0.3)' },
          '100%': { backgroundColor: 'transparent' },
        },
        scanline: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        }
      }
    },
  },
  plugins: [],
}
