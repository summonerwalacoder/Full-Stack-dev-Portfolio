import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#0A0F1C",
          raised: "#0E1524",
          lift: "#131C2E",
        },
        frost: {
          50: "#F2F6FB",
          100: "#E4EBF4",
          300: "#AFC3DA",
          400: "#8FAAC8",
          500: "#6E8FB2",
          600: "#4E6E92",
        },
        glacier: {
          DEFAULT: "#9CC5E8",
          dim: "#6E93B8",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "Times New Roman", "serif"],
        body: [
          "var(--font-body)",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Nirmala UI",
          "Yu Gothic UI",
          "sans-serif",
        ],
        deva: [
          "var(--font-deva)",
          "Noto Sans Devanagari",
          "Nirmala UI",
          "Mangal",
          "sans-serif",
        ],
      },
      maxWidth: {
        shell: "68rem",
      },
      letterSpacing: {
        wordmark: "0.32em",
        label: "0.22em",
      },
      transitionTimingFunction: {
        soft: "cubic-bezier(0.22, 0.61, 0.36, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
