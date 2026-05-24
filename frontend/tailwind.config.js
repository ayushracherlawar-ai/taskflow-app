/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans:    ["'DM Sans'",   "sans-serif"],
        display: ["'Syne'",      "sans-serif"],
        mono:    ["'DM Mono'",   "monospace"],
      },
      colors: {
        brand: {
          50:  "#eef2ff",
          100: "#e0e7ff",
          200: "#c7d2fe",
          400: "#818cf8",
          500: "#6366f1",
          600: "#4f46e5",
          700: "#4338ca",
        },
        surface: {
          DEFAULT: "#ffffff",
          dark:    "#151823",
        },
      },
      boxShadow: {
        glass:    "0 8px 32px 0 rgba(31, 38, 135, 0.10)",
        "glass-dark": "0 8px 32px 0 rgba(0,0,0,0.32)",
        card:     "0 1px 3px rgba(0,0,0,0.07), 0 4px 16px rgba(0,0,0,0.06)",
        "card-hover": "0 4px 24px rgba(99,102,241,0.15)",
      },
      backdropBlur: { xs: "2px" },
      animation: {
        "fade-in":     "fadeIn 0.4s ease both",
        "slide-up":    "slideUp 0.45s cubic-bezier(.16,1,.3,1) both",
        "slide-right": "slideRight 0.35s cubic-bezier(.16,1,.3,1) both",
        "bounce-in":   "bounceIn 0.5s cubic-bezier(.34,1.56,.64,1) both",
        "pulse-slow":  "pulse 3s ease-in-out infinite",
        "spin-slow":   "spin 2s linear infinite",
        shimmer:       "shimmer 1.4s ease infinite",
      },
      keyframes: {
        fadeIn:     { from: { opacity: 0 },                       to: { opacity: 1 } },
        slideUp:    { from: { opacity: 0, transform: "translateY(20px)" }, to: { opacity: 1, transform: "translateY(0)" } },
        slideRight: { from: { opacity: 0, transform: "translateX(-20px)" }, to: { opacity: 1, transform: "translateX(0)" } },
        bounceIn:   { from: { opacity: 0, transform: "scale(.85)" }, to: { opacity: 1, transform: "scale(1)" } },
        shimmer: {
          "0%":   { backgroundPosition: "-400px 0" },
          "100%": { backgroundPosition:  "400px 0" },
        },
      },
    },
  },
  plugins: [],
};