import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        rose: {
          DEFAULT: "#b5175f",
          deep: "#7a1246",
          soft: "#fce7f0",
          mist: "#fff5f9",
        },
        gold: "#c98a2b",
      },
      fontFamily: {
        sans: ["var(--font-hind)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(122, 18, 70, 0.25)",
      },
      borderRadius: {
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
export default config;
