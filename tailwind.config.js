// eslint-disable-next-line @typescript-eslint/no-var-requires
const iOSHeight = require('@rvxlab/tailwind-plugin-ios-full-height');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/features/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: [iOSHeight],
  darkMode: 'class'
}
