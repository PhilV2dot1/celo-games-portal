import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        celo: "#FCFF52",
        "celo-dark": "#E5E600",
        chain: "var(--chain-primary)",
        "chain-hover": "var(--chain-hover)",
        "chain-light": "var(--chain-light)",
        "chain-dark": "var(--chain-dark)",
        "chain-contrast": "var(--chain-contrast)",
      },
    },
  },
  plugins: [],
};
export default config;
