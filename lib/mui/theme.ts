"use client"

import { createTheme } from "@mui/material/styles"

/**
 * Material UI theme for the dashboard.
 *
 * - Uses CSS variables so light and dark schemes are both emitted on the
 *   server and switched purely by the `.dark` / `.light` class that
 *   next-themes puts on <html> (no flash on load).
 * - Brand colours: cyan (primary) and EEAM rose (secondary).
 */
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#0891b2", light: "#22d3ee", dark: "#0e7490", contrastText: "#ffffff" },
        secondary: { main: "#e11d48", light: "#fb7185", dark: "#be123c", contrastText: "#ffffff" },
        background: { default: "#f4f6fb", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#22d3ee", light: "#67e8f9", dark: "#0891b2", contrastText: "#06222a" },
        secondary: { main: "#fb7185", light: "#fda4af", dark: "#e11d48", contrastText: "#2a0610" },
        background: { default: "#0b0f17", paper: "#121826" },
      },
    },
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: [
      "Roboto",
      "-apple-system",
      "BlinkMacSystemFont",
      '"Segoe UI"',
      "Helvetica",
      "Arial",
      "sans-serif",
    ].join(","),
    button: { textTransform: "none", fontWeight: 600 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    h6: { fontWeight: 600 },
  },
  components: {
    MuiCard: {
      defaultProps: { variant: "outlined" },
      styleOverrides: { root: { borderRadius: 16 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 12 } },
    },
  },
})

export default theme
