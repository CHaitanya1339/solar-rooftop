
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  presets: [require('@spartan-ng/ui-core/hlm-tailwind-preset')],
  content: [
    './src/**/*.{html,ts}',
    './components/**/*.{html,ts}',
  ],
  theme: {
    extend: {
      backgroundColor: {
        'dark': '#000000',
      },
    },
  },
  plugins: [],
};
