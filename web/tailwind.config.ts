import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Brand ink — the deep plum of the logo background.
        plum: {
          DEFAULT: "#3a1b2b",
          deep: "#2a1220",
          soft: "#6a4356",
        },
        // Primary — warm magenta from the logo gradient.
        rose: {
          DEFAULT: "#d6336c",
          deep: "#7a1246",
          soft: "#fce7f0",
          mist: "#fff5f9",
        },
        // Accents pulled from the logo's leaf + sparkle.
        leaf: { DEFAULT: "#57ab7d", soft: "#e3f3ea" },
        apricot: { DEFAULT: "#f3c579", soft: "#fdf1dc" },
        cream: "#fff9f4",
        blush: "#ffeef4",
        gold: "#c98a2b",
      },
      fontFamily: {
        sans: ["var(--font-hind)", "system-ui", "sans-serif"],
        display: ["var(--font-baloo)", "var(--font-hind)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 8px 30px -12px rgba(122, 18, 70, 0.25)",
        card: "0 18px 50px -20px rgba(58, 27, 43, 0.45)",
        lift: "0 4px 16px -6px rgba(122, 18, 70, 0.3)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        wave: {
          "0%,60%,100%": { transform: "rotate(0deg)" },
          "10%,30%": { transform: "rotate(14deg)" },
          "20%": { transform: "rotate(-8deg)" },
          "40%": { transform: "rotate(10deg)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-6px)" },
        },
        twinkle: {
          "0%,100%": { opacity: "0.4", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
      animation: {
        wave: "wave 2.6s ease-in-out 0.4s 2",
        float: "float 5s ease-in-out infinite",
        twinkle: "twinkle 2.4s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
