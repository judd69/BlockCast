/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: { display: ['"Space Grotesk"', 'sans-serif'], sans: ['"DM Sans"', 'sans-serif'] },
      colors: { ink: '#080b12', panel: '#101620', mint: '#9dffcc', coral: '#ff8066' },
      boxShadow: { glow: '0 0 40px rgba(157, 255, 204, 0.12)' },
    },
  },
  plugins: [],
}