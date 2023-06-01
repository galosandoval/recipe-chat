/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {}
  },
  plugins: [
    require('@rvxlab/tailwind-plugin-ios-full-height'),
    require('@tailwindcss/typography'),
    require('daisyui')
  ],
  darkMode: 'class'
}
