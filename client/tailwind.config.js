/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Paleta sacada del logo (mayo treinta / 30M). Se remplazan "indigo" y "gray" de Tailwind
      // por tonos calidos (crema/negro/rosa) en vez de agregar clases nuevas en cada archivo:
      // toda la app ya usaba bg-indigo-600 / text-gray-500 / etc, asi que heredan la marca solas.
      colors: {
        indigo: {
          50: '#FDF1F4',
          100: '#FBE3E9',
          200: '#F6C6D3',
          300: '#EE9AB1',
          400: '#E26C8D',
          500: '#D8477B',
          600: '#D42E5E',
          700: '#B21F4C',
          800: '#8E1A3C',
          900: '#6B1430',
        },
        gray: {
          50: '#FAF6EC',
          100: '#F3ECDC',
          200: '#E8DFC8',
          300: '#D8CBAE',
          400: '#AFA186',
          500: '#8C8068',
          600: '#6B6355',
          700: '#4A4538',
          800: '#332F26',
          900: '#211D17',
        },
        cream: '#FFF9EB',
        ink: '#27241B',
        night: '#0B1220',
        surface: '#141E33',
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
};
