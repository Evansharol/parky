/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#eef9ff',
          100: '#d9f1ff',
          200: '#bbe5ff',
          300: '#8ed4ff',
          400: '#58baff',
          500: '#30a0ff',
          600: '#1a7ff5',
          700: '#1366e1',
          800: '#1652b6',
          900: '#18468f',
          950: '#132b57',
        },
        dark: {
          900: '#0a0f1e',
          800: '#0d1528',
          700: '#111d35',
          600: '#162341',
          500: '#1d2d52',
        },
        accent: {
          green:  '#22d3a6',
          orange: '#f97316',
          purple: '#a855f7',
          yellow: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #0a0f1e 0%, #132b57 50%, #1a7ff5 100%)',
        'card-gradient': 'linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))',
        'glow-blue': 'radial-gradient(ellipse at center, rgba(26,127,245,0.3) 0%, transparent 70%)',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(0,0,0,0.3)',
        glow: '0 0 24px rgba(26,127,245,0.4)',
        'glow-sm': '0 0 12px rgba(26,127,245,0.25)',
        card: '0 4px 24px rgba(0,0,0,0.2)',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(20px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        float: { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
      },
    },
  },
  plugins: [],
};
