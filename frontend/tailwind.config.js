/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Noto Sans JP'", 'system-ui', 'sans-serif'],
      },
      colors: {
        surface: 'rgba(255,255,255,0.04)',
        border: 'rgba(255,255,255,0.10)',
      },
    },
  },
  plugins: [],
}
