/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary": "#006e2f",
        "primary-container": "#22c55e",
        "on-primary": "#ffffff",
        "on-primary-container": "#004b1e",
        "background": "#f3fcef",
        "on-background": "#161d16",
        "surface": "#f3fcef",
        "on-surface": "#161d16",
        "on-surface-variant": "#3d4a3d",
        "outline": "#6d7b6c",
        "outline-variant": "#bccbb9",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#edf6ea",
        "surface-container-highest": "#dce5d9",
        "error": "#ba1a1a",
      },
      fontFamily: {
        lexend: ["Lexend", "sans-serif"],
      },
    },
  },
  plugins: [],
};