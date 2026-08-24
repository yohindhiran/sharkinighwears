import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: { ink: "#211d1a", rose: "#b77c73", sand: "#f4efe8", blush: "#eadbd5", gold: "#a4814d", cream: "#faf9f6" },
      fontFamily: { sans: ["var(--font-manrope)"], display: ["var(--font-cormorant)"] },
      letterSpacing: { luxury: "0.22em" },
    },
  },
  plugins: [],
};

export default config;
