/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        yellow: { accent: "#e3f500" },
        blue: { accent: "#94c3ff" },
      },
      fontFamily: {
        hebrew: ["Heebo", "Assistant", "sans-serif"],
      },
      borderRadius: {
        card: "25px",
        badge: "30px",
      },
      boxShadow: {
        card: "0 0 6.3px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
}

