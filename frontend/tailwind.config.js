/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#3F72AF', light: '#7F9EB2', dark: '#112D4E' },
        accent: { DEFAULT: '#D89232', light: '#E8D5B5', dark: '#A56F21' },
        petbg: { DEFAULT: '#EBF0FA', light: '#F4F7FB', dark: '#CBD5E1' },
        secondary: { DEFAULT: '#10B981', light: '#D1FAE5' },
      },
    },
  },
  plugins: [],
};

