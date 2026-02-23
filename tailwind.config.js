/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#f0f4ff",
          100: "#e0e9ff",
          500: "#4f6ef7",
          600: "#3b56e8",
          700: "#2d43c7",
          900: "#1a1a2e",
        },
        accent: {
          400: "#f97316",
          500: "#ea6c0a",
        },
      },
    },
  },
  plugins: [],
};
