/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        eco: {
          50: '#f2f8f4',
          100: '#e1efe6',
          200: '#c5dfce',
          300: '#9bc8aa',
          400: '#6ca881',
          500: '#4c8c62',
          600: '#39704c',
          700: '#2f5a3e',
          800: '#274933',
          900: '#213d2b',
          950: '#112217',
        },
        forest: {
          50: '#f4f7f5',
          100: '#e4ebe6',
          200: '#ccd9cf',
          300: '#a7bfae',
          400: '#7c9f87',
          500: '#5c8068',
          600: '#466651',
          700: '#3a5242',
          800: '#304236',
          900: '#29372f',
          950: '#141d18',
        }
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
