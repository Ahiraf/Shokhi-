import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Soft plum-brown ink (text/headings) — gentle, not harsh black.
        plum: {
          DEFAULT: "#54454c",
          deep: "#3e323a",
          soft: "#8d7f86",
        },
        // Primary — a dusty, low-saturation rose (mauve), calm not candy-pink.
        rose: {
          DEFAULT: "#c17a8e",
          deep: "#9c5c72",
          soft: "#f3e7ec",
          mist: "#fbf4f6",
        },
        // Secondary accent — muted sage (health / calm), used sparingly.
        sage: { DEFAULT: "#8aae95", deep: "#5f8a6d", soft: "#e9f0ea" },
        apricot: { DEFAULT: "#e6c28a", soft: "#f6ecd9" },
        cream: "#faf6f1",
        blush: "#f6ebef",
        gold: "#c98a2b",
      },
      fontFamily: {
        sans: ["var(--font-hind)", "system-ui", "sans-serif"],
        display: ["var(--font-baloo)", "var(--font-hind)", "sans-serif"],
      },
      boxShadow: {
        soft: "0 6px 24px -14px rgba(84, 69, 76, 0.35)",
        card: "0 14px 44px -22px rgba(84, 69, 76, 0.4)",
        lift: "0 3px 12px -5px rgba(156, 92, 114, 0.35)",
      },
      borderRadius: {
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-5px)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
