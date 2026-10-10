import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0a0b0e",
        surface: {
          DEFAULT: "#12141a",
          card: "#181b24",
          elevated: "#222734",
          border: "#2b3244",
        },
        gold: {
          50: "#fffbeb",
          100: "#fef3c7",
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
          700: "#b45309",
          800: "#92400e",
          900: "#78350f",
          accent: "#ffd700",
        },
        emerald: {
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
        },
        crimson: {
          400: "#f87171",
          500: "#ef4444",
          600: "#dc2626",
        }
      },
      boxShadow: {
        'glow-gold': '0 0 20px -5px rgba(245, 158, 11, 0.4)',
        'glow-emerald': '0 0 20px -5px rgba(16, 185, 129, 0.4)',
        'bottom-nav': '0 -4px 20px rgba(0, 0, 0, 0.6)',
      },
      screens: {
        'mobile': '360px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
