/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        "tiempos-headline": ["'Tiempos Headline'", "serif"],
      },
      colors: {
        "socratica-cream": "#FBF8EF",
        "socratica-black": "#121212",
      },
    },
  },
  plugins: [],
};
