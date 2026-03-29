/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#4318FF",
          50: "#EDE8FF",
          100: "#D4C8FF",
          200: "#A991FF",
          300: "#7E5AFF",
          400: "#5C34FF",
          500: "#4318FF",
          600: "#3511CC",
          700: "#270D99",
          800: "#1A0866",
          900: "#0D0433",
        },
        navy: {
          950: "#060B28",
          900: "#0F1535",
          800: "#141727",
          700: "#1A1F37",
          600: "#2D3748",
        },
        success: {
          DEFAULT: "#01B574",
          light: "#061A0D",
        },
        warning: {
          DEFAULT: "#FFB547",
          light: "#1A0E06",
        },
        danger: {
          DEFAULT: "#E53E3E",
          light: "#1A0606",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        heading: ["Space Grotesk", "sans-serif"],
      },
      backgroundImage: {
        "sidebar-gradient":
          "linear-gradient(135deg, #05153F 0%, #072561 100%)",
        "brand-gradient": "linear-gradient(135deg, #868CFF 0%, #4318FF 100%)",
      },
      boxShadow: {
        card:          "0 4px 24px 0 rgba(0,0,0,0.4)",
        "brand-glow":  "0 0 20px rgba(67,24,255,0.3)",
        "neu-light":   "5px 8px 20px rgba(148,163,184,0.38), -3px -4px 12px rgba(255,255,255,0.92)",
        "neu-dark":    "4px 6px 18px rgba(0,0,0,0.58), -2px -2px 8px rgba(255,255,255,0.04)",
        "neu-hover-l": "8px 14px 30px rgba(148,163,184,0.48), -4px -5px 16px rgba(255,255,255,0.98)",
        "neu-hover-d": "6px 12px 30px rgba(0,0,0,0.70), -3px -3px 12px rgba(255,255,255,0.055)",
        "glass":       "0 8px 32px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.18)",
        "kpi-brand":   "0 6px 24px rgba(67,24,255,0.22), inset 0 1px 0 rgba(255,255,255,0.14)",
        "kpi-success": "0 6px 24px rgba(1,181,116,0.18), inset 0 1px 0 rgba(255,255,255,0.14)",
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};
