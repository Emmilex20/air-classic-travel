/* eslint-disable no-undef */
// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      animation: {
        'pulse-orb': 'pulse-orb 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'expand-fade-1': 'expand-fade 2s ease-out infinite',
        'expand-fade-2': 'expand-fade 2s ease-out infinite 0.5s', // Staggered delay
      },
      keyframes: {
        'pulse-orb': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1', boxShadow: '0 0 0px var(--tw-shadow-color)' },
          '50%': { transform: 'scale(1.05)', opacity: '0.9', boxShadow: '0 0 15px var(--tw-shadow-color)' },
        },
        'expand-fade': {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '100%': { transform: 'scale(1.5)', opacity: '0' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
  // VERY IMPORTANT: Safelist dynamic classes
  // Adjust based on the actual colors you use for 'color' prop.
  safelist: [
    // Spinner sizes
    'w-6', 'h-6', 'w-10', 'h-10', 'w-16', 'h-16', 'w-24', 'h-24',
    // Spinner colors for backgrounds and shadows (primary, secondary)
    // Add all primary/secondary colors used in the component
    'bg-indigo-500', 'shadow-indigo-500/80',
    'bg-purple-500', 'shadow-purple-500/80',
    'bg-blue-500', 'shadow-blue-500/80',
    'bg-white', 'shadow-white/80',
    'bg-gray-500', 'shadow-gray-500/80',
    'bg-green-500', 'shadow-green-500/80',
    'bg-red-500', 'shadow-red-500/80',
    // Border colors for rings (if any subtle borders are used) - this design focuses less on borders
    // but keep an eye out if you reintroduce them.
  ],
};