"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

type ToastSeverity = "success" | "info" | "warning" | "error";

type Toast = {
  message: string;
  severity: ToastSeverity;
};

type ToastContextValue = {
  push: (toast: Toast) => void;
  success: (message: string) => void;
  error: (message: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<Toast | null>(null);
  const [open, setOpen] = useState(false);

  const push = useCallback((next: Toast) => {
    setToast(next);
    setOpen(true);
  }, []);

  const value = useMemo<ToastContextValue>(() => ({
    push,
    success: (message: string) => push({ message, severity: "success" }),
    error: (message: string) => push({ message, severity: "error" }),
  }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Snackbar
        open={open}
        onClose={(_, reason) => {
          if (reason === "clickaway") return;
          setOpen(false);
        }}
        autoHideDuration={3500}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        {toast ? (
          <Alert
            onClose={() => setOpen(false)}
            severity={toast.severity}
            variant="filled"
            sx={{ boxShadow: 3 }}
          >
            {toast.message}
          </Alert>
        ) : (
          <span />
        )}
      </Snackbar>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
