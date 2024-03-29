/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./**/*.{html,js}"],
  theme: {
    extend: {
      fontFamily: {
        "tiempos-headline": ["'Tiempos Headline'", "serif"],
        "space-mono": ["'Space Mono'", "monospace"],
        "untitled-sans": ["'Untitled Sans'", "sans-serif"],
      },
      colors: {
        "socratica-cream": "#FBF8EF",
        "socratica-black": "#121212",
        "socratica-grey": "#A09D98",
      },
    },
  },
  plugins: [],
};
