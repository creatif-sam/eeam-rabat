"use client"

import { createTheme } from "@mui/material/styles"

/**
 * Material UI theme for the dashboard.
 *
 * - Uses CSS variables so light and dark schemes are both emitted on the
 *   server and switched purely by the `.dark` / `.light` class that
 *   next-themes puts on <html> (no flash on load).
 * - Brand colours: teal #4ec2cd (primary) and red #b72736 (secondary).
 */
const theme = createTheme({
  cssVariables: { colorSchemeSelector: "class" },
  colorSchemes: {
    light: {
      palette: {
        primary: { main: "#28868f", light: "#4ec2cd", dark: "#227077", contrastText: "#ffffff" },
        secondary: { main: "#b72736", light: "#de6370", dark: "#97202d", contrastText: "#ffffff" },
        error: { main: "#b72736", light: "#de6370", dark: "#97202d", contrastText: "#ffffff" },
        info: { main: "#28868f", light: "#4ec2cd", dark: "#227077", contrastText: "#ffffff" },
        background: { default: "#f4f6fb", paper: "#ffffff" },
      },
    },
    dark: {
      palette: {
        primary: { main: "#4ec2cd", light: "#90d9e0", dark: "#28868f", contrastText: "#0d2d30" },
        secondary: { main: "#de6370", light: "#e99aa2", dark: "#b72736", contrastText: "#370c10" },
        error: { main: "#de6370", light: "#e99aa2", dark: "#b72736", contrastText: "#370c10" },
        info: { main: "#4ec2cd", light: "#90d9e0", dark: "#28868f", contrastText: "#0d2d30" },
        background: { default: "#0b0f17", paper: "#121826" },
      },
    },
  },
  shape: { borderRadius: 8 },
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
      styleOverrides: { root: { borderRadius: 10 } },
    },
    MuiPaper: {
      styleOverrides: { root: { backgroundImage: "none" } },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
    },
    MuiListItemButton: {
      styleOverrides: { root: { borderRadius: 8 } },
    },
  },
})

export default theme
