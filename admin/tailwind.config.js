/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#1e40af', light: '#3b82f6', dark: '#1e3a8a' },
        accent: { DEFAULT: '#f59e0b' },
      },
    },
  },
  plugins: [],
};
