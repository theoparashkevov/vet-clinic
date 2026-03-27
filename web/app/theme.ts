import { createTheme } from "@mui/material/styles";

// Centralized MUI theme tokens (Phase 1).
// Keep this file in /app so App Router code can import consistently.
export const theme = createTheme({
  spacing: 8, // 8px grid
  shape: {
    borderRadius: 12,
  },
  palette: {
    mode: "light",
    primary: {
      main: "#1F6F78",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#C16A43",
      contrastText: "#ffffff",
    },
    error: {
      main: "#D32F2F",
    },
    warning: {
      main: "#ED6C02",
    },
    info: {
      main: "#0288D1",
    },
    success: {
      main: "#2E7D32",
    },
    background: {
      default: "#F6F5F2",
      paper: "#FFFFFF",
    },
  },
  typography: {
    fontFamily: [
      "var(--font-sans)",
      "ui-sans-serif",
      "system-ui",
      "-apple-system",
      "Segoe UI",
      "Roboto",
      "Helvetica",
      "Arial",
      "Apple Color Emoji",
      "Segoe UI Emoji",
    ].join(","),
    h4: { fontWeight: 700, letterSpacing: "-0.02em" },
    h5: { fontWeight: 700, letterSpacing: "-0.01em" },
    h6: { fontWeight: 700 },
    subtitle1: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid rgba(15, 23, 42, 0.08)",
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage:
            "linear-gradient(90deg, rgba(31,111,120,0.10), rgba(193,106,67,0.08))",
          backdropFilter: "saturate(140%) blur(10px)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        head: {
          fontWeight: 700,
          color: "rgba(15, 23, 42, 0.78)",
        },
      },
    },
  },
});
