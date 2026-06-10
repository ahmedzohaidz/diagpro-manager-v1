import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // DiagPro brand identity
        brand: {
          DEFAULT: "#FFD100", // primary yellow
          yellow: "#FFD100",
          dark: "#E6BC00", // hover/darker yellow
        },
        ink: {
          DEFAULT: "#111111", // black accent / text
          soft: "#333333",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
