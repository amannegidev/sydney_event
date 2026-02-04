/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Sora'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
      },
      colors: {
        ink: "#111114",
        fog: "#f6f5f2",
        blush: "#f4ede5",
        accent: "#e07a5f",
        sea: "#3d405b",
      },
      boxShadow: {
        soft: "0 18px 45px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
