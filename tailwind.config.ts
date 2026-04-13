import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta crema cálida — inspirada en Five Pathways
        cream: {
          50:  "#FFFDF9",
          100: "#FFFAF5",
          200: "#FAF5E8",
          300: "#F5EDD8",
          400: "#E8D9B8",
        },
        // Teal/mint — acento primario
        teal: {
          100: "#D4F5F0",
          200: "#A9EBE4",
          300: "#8EE3D8",
          400: "#63CFBF",
          500: "#42B5A5",
          600: "#2E9E8F",
          700: "#1E8070",
        },
        // Ink — escala de negros cálidos para texto y bordes
        ink: {
          900: "#1A1A1A",
          800: "#2D2D2D",
          700: "#404040",
          600: "#555555",
          500: "#6B6B6B",
          400: "#9A9A9A",
          300: "#B8B8B8",
          200: "#D9D9D9",
          100: "#F0F0F0",
          50:  "#F8F8F8",
        },
        // Coral — acento secundario (tendencias, alertas)
        coral: {
          50:  "#fff5f2",
          100: "#ffe8e1",
          200: "#ffd5c8",
          300: "#ffb5a0",
          400: "#ff8c6b",
          500: "#f96a45",
          600: "#e64d27",
        },
        // surface — compatibilidad con código existente
        surface: {
          50:  "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          900: "#0f172a",
          950: "#020617",
        },
        // brand — compatibilidad con rutas internas y stores
        brand: {
          50:  "#f0f7ff",
          100: "#e0effe",
          200: "#bae0fd",
          300: "#7cc8fb",
          400: "#36adf6",
          500: "#0c93e7",
          600: "#0074c5",
          700: "#015da0",
          800: "#064f84",
          900: "#0b426e",
          950: "#072a49",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "Cambria", "serif"],
        sans: [
          "var(--font-sans)",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "sans-serif",
        ],
      },
      borderRadius: {
        "4xl": "2rem",
        full: "9999px",
      },
      boxShadow: {
        // Shadow offset estilo Five Pathways
        "offset-sm":   "3px 3px 0 0 #1A1A1A",
        "offset":      "5px 5px 0 0 #1A1A1A",
        "offset-teal": "5px 5px 0 0 #42B5A5",
        "offset-sm-teal": "3px 3px 0 0 #42B5A5",
        // Sombras legacy para compatibilidad
        card:         "0 1px 3px 0 rgb(0 0 0 / 0.04), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        "card-hover": "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        elevated:     "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
      },
      animation: {
        // Marquee continuo
        "marquee":     "marquee 35s linear infinite",
        "marquee-rev": "marqueeRev 35s linear infinite",
        // Split text animado
        "split-up":    "splitUp 0.7s cubic-bezier(0.23, 1, 0.32, 1) both",
        // Existentes
        "fade-in":      "fadeIn 0.5s ease-out",
        "slide-up":     "slideUp 0.5s ease-out",
        "slide-in-right": "slideInRight 0.3s ease-out",
        "scale-in":     "scaleIn 0.2s ease-out",
        "pulse-soft":   "pulseSoft 2s ease-in-out infinite",
      },
      keyframes: {
        marquee: {
          "0%":   { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        marqueeRev: {
          "0%":   { transform: "translateX(-50%)" },
          "100%": { transform: "translateX(0)" },
        },
        splitUp: {
          "0%":   { transform: "translateY(110%)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        fadeIn: {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%":   { opacity: "0", transform: "translateX(10px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%":   { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.7" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
