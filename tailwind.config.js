/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          50: "#fff0f0",
          100: "#ffe0e0",
          500: "#dc2626",
          600: "#b91c1c",
          700: "#991b1b",
          900: "#0d1b3e",
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
