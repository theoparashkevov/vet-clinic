"use client";

import type { ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { ToastProvider } from "../components/ToastProvider";
import { AuthProvider } from "../components/AuthProvider";
import { KeyboardShortcutsProvider } from "../components/KeyboardShortcuts";
import { ThemeModeProvider } from "../components/ThemeModeProvider";
import CommandPalette from "../components/CommandPalette";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ToastProvider>
        <AuthProvider>
          <KeyboardShortcutsProvider>
            <ThemeModeProvider>
              {children}
              <CommandPalette />
            </ThemeModeProvider>
          </KeyboardShortcutsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
