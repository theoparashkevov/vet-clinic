"use client";

import type { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { ToastProvider } from "../components/ToastProvider";
import { AuthProvider } from "../components/AuthProvider";
import { KeyboardShortcutsProvider } from "../components/KeyboardShortcuts";
import CommandPalette from "../components/CommandPalette";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <AuthProvider>
          <KeyboardShortcutsProvider>
            {children}
            <CommandPalette />
          </KeyboardShortcutsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
