/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0f294a",
          "navy-dark": "#08182d",
          "navy-light": "#1e3a61",
          amber: "#c85a17",
          "amber-hover": "#b24d10",
          emerald: "#0d6e5a",
          "emerald-light": "#e6f4f1",
          stone: "#f8fafc",
          border: "#e2e8f0"
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Plus Jakarta Sans", "Inter", "sans-serif"]
      },
      keyframes: {
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        }
      }
    },
  },
  plugins: [],
}
