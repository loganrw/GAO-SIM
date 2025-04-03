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
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      colors: {
        'ga-blue': '#2F7AB1',
        'ga-blue-light': '#368ecf'
      }
    },
  },
  plugins: [],
}

