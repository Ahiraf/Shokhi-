import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Palette is driven by CSS channel variables (see app/globals.css) so a single
        // `.dark` block can retheme the whole app without touching component classes.
        // rgb(var(--x) / <alpha-value>) keeps Tailwind's opacity modifiers (e.g. /70) working.
        // Soft plum-brown ink (text/headings) — gentle, not harsh black.
        plum: {
          DEFAULT: "rgb(var(--c-plum) / <alpha-value>)",
          deep: "rgb(var(--c-plum-deep) / <alpha-value>)",
          soft: "rgb(var(--c-plum-soft) / <alpha-value>)",
        },
        // Primary — a dusty, low-saturation rose (mauve), calm not candy-pink.
        rose: {
          DEFAULT: "rgb(var(--c-rose) / <alpha-value>)",
          deep: "rgb(var(--c-rose-deep) / <alpha-value>)",
          soft: "rgb(var(--c-rose-soft) / <alpha-value>)",
          mist: "rgb(var(--c-rose-mist) / <alpha-value>)",
        },
        // Secondary accent — muted sage (health / calm), used sparingly.
        sage: {
          DEFAULT: "rgb(var(--c-sage) / <alpha-value>)",
          deep: "rgb(var(--c-sage-deep) / <alpha-value>)",
          soft: "rgb(var(--c-sage-soft) / <alpha-value>)",
        },
        apricot: {
          DEFAULT: "rgb(var(--c-apricot) / <alpha-value>)",
          soft: "rgb(var(--c-apricot-soft) / <alpha-value>)",
        },
        cream: "rgb(var(--c-cream) / <alpha-value>)",
        blush: "rgb(var(--c-blush) / <alpha-value>)",
        gold: "rgb(var(--c-gold) / <alpha-value>)",
        // Ink for text sitting on a SOLID rose/sage fill. Flips per mode: white in
        // light mode, deep-rose in dark mode (where those fills become light).
        accentink: "rgb(var(--c-accentink) / <alpha-value>)",
        // Card / raised surface — was literal `white`; a variable so cards darken too.
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        // Dark feature banner (always dark in BOTH themes, worn with white text).
        // Distinct from `plum` (ink) so it stays a background, not inverted to light.
        panel: {
          DEFAULT: "rgb(var(--c-panel) / <alpha-value>)",
          deep: "rgb(var(--c-panel-deep) / <alpha-value>)",
        },
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
