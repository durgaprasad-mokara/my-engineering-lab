import type { Config } from "tailwindcss";

const hsl = (v: string) => `hsl(var(${v}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem" },
    extend: {
      colors: {
        background: hsl("--background"),
        foreground: hsl("--foreground"),
        surface: { DEFAULT: hsl("--surface"), raised: hsl("--surface-raised") },
        border: hsl("--border"),
        input: hsl("--border"),
        ring: hsl("--accent"),
        muted: { DEFAULT: hsl("--surface-raised"), foreground: hsl("--muted-foreground") },
        primary: { DEFAULT: hsl("--primary"), foreground: hsl("--primary-foreground") },
        accent: { DEFAULT: hsl("--accent"), foreground: hsl("--background") },
        violet: hsl("--violet"),
        success: hsl("--success"),
        warning: hsl("--warning"),
        danger: hsl("--danger"),
      },
      borderRadius: { sm: "6px", md: "8px", lg: "12px" },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 0 1px hsl(var(--accent) / 0.35), 0 0 24px -4px hsl(var(--accent) / 0.45)",
        card: "inset 0 1px 0 0 hsl(0 0% 100% / 0.03)",
      },
      keyframes: {
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        "slide-in-left": { from: { transform: "translateX(-100%)" }, to: { transform: "translateX(0)" } },
        pulse_dot: { "0%,100%": { opacity: "1" }, "50%": { opacity: ".35" } },
      },
      animation: {
        "fade-in": "fade-in 150ms ease-out",
        "slide-in-left": "slide-in-left 200ms ease-out",
        "pulse-dot": "pulse_dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
