/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#2D6A4F', light: '#52B788', dark: '#1B4332' },
        accent: { DEFAULT: '#F4A261', light: '#FFDDD2' },
      },
    },
  },
  plugins: [],
};
