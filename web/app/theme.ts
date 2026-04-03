import { createTheme } from "@mui/material/styles";

// Modern, professional veterinary clinic theme
// Warm neutrals with teal accents - clean, trustworthy, professional

export const theme = createTheme({
  spacing: 8,
  shape: {
    borderRadius: 12,
  },
  palette: {
    mode: "light",
    primary: {
      main: "#0D7377",
      light: "#14A098",
      dark: "#0A5A5D",
      contrastText: "#FFFFFF",
    },
    secondary: {
      main: "#C4705A",
      light: "#D98B75",
      dark: "#A55A47",
      contrastText: "#FFFFFF",
    },
    error: {
      main: "#DC2626",
      light: "#FEE2E2",
      dark: "#991B1B",
    },
    warning: {
      main: "#D97706",
      light: "#FEF3C7",
      dark: "#92400E",
    },
    info: {
      main: "#0284C7",
      light: "#E0F2FE",
      dark: "#075985",
    },
    success: {
      main: "#059669",
      light: "#D1FAE5",
      dark: "#065F46",
    },
    background: {
      default: "#FAFAF8",
      paper: "#FFFFFF",
    },
    text: {
      primary: "#1C1917",
      secondary: "#57534E",
      disabled: "#A8A29E",
    },
    divider: "#E7E5E4",
    grey: {
      50: "#FAFAF9",
      100: "#F5F5F4",
      200: "#E7E5E4",
      300: "#D6D3D1",
      400: "#A8A29E",
      500: "#78716C",
      600: "#57534E",
      700: "#44403C",
      800: "#292524",
      900: "#1C1917",
    },
  },
  typography: {
    fontFamily: [
      "var(--font-sans)",
      "Plus Jakarta Sans",
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
    h1: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      letterSpacing: "-0.025em",
      lineHeight: 1.2,
    },
    h3: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 700,
      letterSpacing: "-0.02em",
      lineHeight: 1.3,
    },
    h5: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      letterSpacing: "-0.01em",
      lineHeight: 1.4,
    },
    subtitle1: {
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontWeight: 600,
      lineHeight: 1.5,
      fontSize: "0.875rem",
    },
    body1: {
      lineHeight: 1.6,
    },
    body2: {
      lineHeight: 1.6,
      fontSize: "0.875rem",
    },
    button: {
      textTransform: "none",
      fontWeight: 600,
      letterSpacing: "0.01em",
    },
    caption: {
      fontSize: "0.75rem",
      fontWeight: 500,
      letterSpacing: "0.01em",
    },
    overline: {
      fontSize: "0.75rem",
      fontWeight: 600,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          textRendering: "optimizeLegibility",
          WebkitFontSmoothing: "antialiased",
          MozOsxFontSmoothing: "grayscale",
          backgroundColor: "#FAFAF8",
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          border: "1px solid #E7E5E4",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
          backgroundImage: "none",
        },
        elevation1: {
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
        },
        elevation2: {
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)",
        },
        elevation3: {
          boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.03)",
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          border: "1px solid #E7E5E4",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
          overflow: "hidden",
        },
      },
    },
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: 24,
          "&:last-child": {
            paddingBottom: 24,
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          padding: "10px 20px",
          fontSize: "0.875rem",
          transition: "all 0.2s ease-in-out",
          boxShadow: "none",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(13, 115, 119, 0.15)",
            transform: "translateY(-1px)",
          },
        },
        contained: {
          boxShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
        },
        outlined: {
          borderWidth: 1.5,
          "&:hover": {
            borderWidth: 1.5,
          },
        },
        sizeSmall: {
          padding: "6px 14px",
          fontSize: "0.8125rem",
        },
        sizeLarge: {
          padding: "14px 28px",
          fontSize: "0.9375rem",
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "all 0.15s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(13, 115, 119, 0.08)",
          },
        },
        sizeSmall: {
          padding: 6,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
            backgroundColor: "#FFFFFF",
            transition: "all 0.2s ease-in-out",
            "& fieldset": {
              borderColor: "#E7E5E4",
              borderWidth: 1.5,
            },
            "&:hover fieldset": {
              borderColor: "#D6D3D1",
            },
            "&.Mui-focused fieldset": {
              borderColor: "#0D7377",
              borderWidth: 1.5,
            },
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          color: "#57534E",
          "&.Mui-focused": {
            color: "#0D7377",
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          fontSize: "0.75rem",
          height: 28,
        },
        sizeSmall: {
          height: 24,
          fontSize: "0.6875rem",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: "1px solid #F5F5F4",
          padding: "16px",
        },
        head: {
          fontWeight: 600,
          color: "#57534E",
          backgroundColor: "#FAFAF9",
          borderBottom: "1px solid #E7E5E4",
          fontSize: "0.75rem",
          letterSpacing: "0.025em",
          textTransform: "uppercase",
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: "background-color 0.15s ease-in-out",
          "&:hover": {
            backgroundColor: "#FAFAF9",
          },
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
          transition: "all 0.15s ease-in-out",
          "&:hover": {
            backgroundColor: "rgba(13, 115, 119, 0.06)",
          },
          "&.Mui-selected": {
            backgroundColor: "#0D7377",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#0A5A5D",
            },
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: "inherit",
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: "#E7E5E4",
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          textTransform: "none",
          borderWidth: 1.5,
          "&.Mui-selected": {
            backgroundColor: "#0D7377",
            color: "#FFFFFF",
            "&:hover": {
              backgroundColor: "#0A5A5D",
            },
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: 10,
          },
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiSkeleton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          backgroundColor: "#F5F5F4",
        },
      },
    },
    MuiStepper: {
      styleOverrides: {
        root: {
          padding: "24px 0",
        },
      },
    },
    MuiStepLabel: {
      styleOverrides: {
        label: {
          fontWeight: 500,
          "&.Mui-active": {
            fontWeight: 600,
            color: "#0D7377",
          },
          "&.Mui-completed": {
            fontWeight: 600,
            color: "#059669",
          },
        },
      },
    },
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 600,
          "&.Mui-selected": {
            backgroundColor: "#0D7377",
            color: "#FFFFFF",
          },
        },
      },
    },
  },
});
