/* eslint-disable no-undef */
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'], // Ensure Inter is defined if you're using it
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'), // Add this line
  ],
}