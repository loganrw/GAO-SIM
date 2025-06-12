/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,sass,ts}",
    "./src/app/**",
  ],
  variants: {
    backgroundColor: ({ after }) => after(['disabled'])
  },
  theme: {
    extend: {
      colors: {
        'ga-blue': '#2F7AB1',
        'ga-blue-light': '#368ecf'
      }
    },
  },
  plugins: [],
}

