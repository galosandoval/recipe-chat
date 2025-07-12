/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      fontFamily: {
        roboto: ['var(--font-roboto)']
      }
    }
  },
  plugins: [require('@tailwindcss/typography')],
  darkMode: 'class'
}
