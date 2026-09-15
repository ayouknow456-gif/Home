import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1a237e",
          dark: "#10164f",
          light: "#3949ab",
        },
        accent: {
          DEFAULT: "#f9a825",
          dark: "#c17900",
        },
      },
      fontFamily: {
        sarabun: ["var(--font-sarabun)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
