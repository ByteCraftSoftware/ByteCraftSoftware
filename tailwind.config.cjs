/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          orange: "#EF7603",
          dark: "#151515",
          // The page backdrop. Sections read as lit sheets floating on it, so
          // this is the one value to change if the site wants to be lighter or
          // darker overall — nothing else encodes the page colour.
          ink: "#0F172A",
          // Section surface: brand orange at roughly 20% over white. Two
          // things have to hold at once, and they pull in different
          // directions. It has to keep the orange cast the original
          // `rgba(239,118,3,0.04)` wash gave the page — that tint is the
          // brand, and a neutral stone reads as a different company. And it
          // has to sit far enough below white that the cards INSIDE a section
          // read as their own layer; the first attempt at #FDFAF6 was ~2% off
          // white and looked like a rendering fault rather than a stack.
          //
          // So: hue from the orange, value from the contrast requirement.
          // Warmer/stronger tint, same lightness — do not lighten this without
          // also checking the white cards still separate.
          surface: "#F7E2CB",
        },
      },
      boxShadow: {
        // Near-black rather than slate: a light shadow is invisible against the
        // dark backdrop, and the lift is what separates sheet from page.
        "brand-soft": "0 18px 45px rgba(2, 6, 23, 0.45)",
      },
      borderRadius: {
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};
