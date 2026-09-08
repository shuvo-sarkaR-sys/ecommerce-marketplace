import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: "#F6F3EC",
        paper: "#FBFAF7",
        ink: "#201E1B",
        charcoal: "#3A362F",
        stone: "#8C8474",
        sand: "#E4DCC9",
        oxblood: "#7A3524",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "Georgia", "serif"],
        sans: ["var(--font-work-sans)", "Helvetica", "Arial", "sans-serif"],
      },
      fontSize: {
        display: ["4.5rem", { lineHeight: "1.02", letterSpacing: "-0.01em" }],
        h1: ["2.75rem", { lineHeight: "1.08", letterSpacing: "-0.01em" }],
        h2: ["2rem", { lineHeight: "1.15" }],
        h3: ["1.5rem", { lineHeight: "1.25" }],
        body: ["1rem", { lineHeight: "1.6" }],
        caption: ["0.875rem", { lineHeight: "1.5" }],
        label: ["0.75rem", { lineHeight: "1.4", letterSpacing: "0.06em" }],
      },
      borderRadius: {
        none: "0px",
        sm: "2px",
        DEFAULT: "2px",
        md: "3px",
      },
      maxWidth: {
        container: "1600px",
      },
      transitionTimingFunction: {
        editorial: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
