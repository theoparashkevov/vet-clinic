"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";

type ThemeMode = "light" | "dark";

interface ThemeContextValue {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeModeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage on mount
  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme-mode");
    if (stored === "dark" || stored === "light") {
      setModeState(stored);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setModeState(prefersDark ? "dark" : "light");
    }
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (!mounted) return;
    
    const root = document.documentElement;
    if (mode === "dark") {
      root.classList.add("dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.style.colorScheme = "light";
    }
    
    localStorage.setItem("theme-mode", mode);
  }, [mode, mounted]);

  const toggleTheme = () => {
    setModeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const setMode = (newMode: ThemeMode) => {
    setModeState(newMode);
  };

  // Prevent flash of wrong theme
  if (!mounted) {
    return <>{children}</>;
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useThemeMode must be used within ThemeModeProvider");
  return ctx;
}

// Toggle button component
export function ThemeToggleButton() {
  const { mode, toggleTheme } = useThemeMode();

  return (
    <Tooltip title={`Switch to ${mode === "light" ? "dark" : "light"} mode`}>
      <IconButton onClick={toggleTheme} color="inherit">
        {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
      </IconButton>
    </Tooltip>
  );
}

// Theme-aware wrapper for pages
export function ThemeWrapper({ children }: { children: ReactNode }) {
  const { mode } = useThemeMode();
  
  return (
    <div data-theme={mode} style={{ minHeight: "100vh" }}>
      {children}
    </div>
  );
}
