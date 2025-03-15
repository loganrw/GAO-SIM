/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,sass,ts}",
    "./src/app/**",
  ],
  theme: {
    extend: {
      screens: {
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
      },
      colors: {

      }
    },
  },
  plugins: [],
}

