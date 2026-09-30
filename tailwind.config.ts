import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        espresso: {
          50: "#f7f3ef",
          100: "#ecdfd2",
          200: "#d8bd9f",
          300: "#c39a6c",
          400: "#a97a44",
          500: "#8a5f34",
          600: "#6b4a2a",
          700: "#4a3320",
          800: "#2f2015", // primary dark brand bg
          900: "#1c130c", // near-black espresso (logo bg)
          950: "#120c07",
        },
        gold: {
          50: "#fdf8ec",
          100: "#f9edc9",
          200: "#f1d98f",
          300: "#e8c257",
          400: "#dead38", // primary gold
          500: "#c4922a",
          600: "#a17420",
          700: "#7e5a1c",
          800: "#65481c",
          900: "#553d1c",
        },
        cream: "#f7f1e6",
      },
      fontFamily: {
        display: ["'Playfair Display'", "Georgia", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "espresso-gradient":
          "linear-gradient(135deg, #1c130c 0%, #2f2015 55%, #1c130c 100%)",
        "gold-gradient": "linear-gradient(135deg, #f1d98f 0%, #dead38 50%, #a17420 100%)",
      },
      boxShadow: {
        gold: "0 4px 20px -2px rgba(222,173,56,0.35)",
        card: "0 8px 30px -8px rgba(28,19,12,0.25)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        shimmer: "shimmer 2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
