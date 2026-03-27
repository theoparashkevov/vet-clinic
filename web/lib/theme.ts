import { createTheme } from "@mui/material/styles";

// MUI-first refresh theme tokens.
export const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1F6F78",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#C16A43",
    },
    background: {
      default: "#F6F5F2",
      paper: "#FFFFFF",
    },
  },
  shape: {
    borderRadius: 12,
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
    h4: { fontWeight: 700 },
    h5: { fontWeight: 700 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  components: {
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
