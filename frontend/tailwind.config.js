/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          900: '#0a0c10',
          800: '#0f172a',
          700: '#1e293b',
        },
        aegis: {
          blue: '#3b82f6',
          indigo: '#6366f1',
          emerald: '#10b981',
          gold: '#fbbf24',
          crimson: '#ef4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        outfit: ['Outfit', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))',
      },
      boxShadow: {
        'premium': '0 0 50px -12px rgba(59, 130, 246, 0.25)',
      }
    },
  },
  plugins: [],
}
