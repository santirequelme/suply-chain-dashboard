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
        card: "0 4px 24px 0 rgba(0,0,0,0.4)",
        "brand-glow": "0 0 20px rgba(67,24,255,0.3)",
      },
      borderColor: {
        DEFAULT: "rgba(255,255,255,0.08)",
      },
    },
  },
  plugins: [],
};
