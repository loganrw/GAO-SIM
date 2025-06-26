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
      },
      keyframes: {
        wiggle: {
          '100%': {
            transform: 'rotate(-3deg)'
          },
          '50%': {
            transform: 'rotate(3deg)'
          }
        }
      },
      animation: {
        'ping': 'ping 3s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}

