import type { Config } from "tailwindcss";

/** Brand palettes generated from the two EEAM brand colours. */
const brandTeal = {
  "50": "#edfbfd",
  "100": "#d7f6f9",
  "200": "#bbe8ec",
  "300": "#90d9e0",
  "400": "#68cbd4",
  "500": "#4ec2cd",
  "600": "#28868f",
  "700": "#227077",
  "800": "#1b5a5f",
  "900": "#15474c",
  "950": "#0d2d30"
} // #4ec2cd

const brandRed = {
  "50": "#fef1f2",
  "100": "#fcdee1",
  "200": "#f2c4c9",
  "300": "#e99aa2",
  "400": "#de6370",
  "500": "#d43546",
  "600": "#b72736",
  "700": "#97202d",
  "800": "#7a1a24",
  "900": "#5c141b",
  "950": "#370c10"
} // #b72736

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand: every cool accent maps to #4ec2cd, every warm accent to #b72736.
        // Green/amber/yellow/orange stay as success/warning status colours.
        brand: { teal: brandTeal, red: brandRed },
        cyan: brandTeal,
        teal: brandTeal,
        sky: brandTeal,
        blue: brandTeal,
        indigo: brandTeal,
        rose: brandRed,
        pink: brandRed,
        red: brandRed,
        purple: brandRed,
        violet: brandRed,
        fuchsia: brandRed,
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.625rem",   // 10px
        "2xl": "0.75rem", // 12px
        "3xl": "1rem",    // 16px
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
