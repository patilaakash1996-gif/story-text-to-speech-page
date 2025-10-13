const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // NEW - Set 'Inter' as the primary sans-serif font
        sans: ['Inter', ...fontFamily.sans],
      },
    },
  },
  plugins: [],
};
