"use client";

import type { ReactNode } from "react";
import { createContext, useCallback, useContext, useMemo, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import WarningIcon from "@mui/icons-material/Warning";

type ToastSeverity = "success" | "info" | "warning" | "error";

interface ToastAction {
  label: string;
  onClick: () => void;
}

interface Toast {
  id: string;
  message: string;
  severity: ToastSeverity;
  duration?: number;
  action?: ToastAction;
  persistent?: boolean;
}

interface ToastContextValue {
  push: (toast: Omit<Toast, "id">) => void;
  success: (message: string, options?: Omit<Omit<Toast, "id" | "message" | "severity">, "id" | "message" | "severity">) => void;
  error: (message: string, options?: Omit<Omit<Toast, "id" | "message" | "severity">, "id" | "message" | "severity">) => void;
  info: (message: string, options?: Omit<Omit<Toast, "id" | "message" | "severity">, "id" | "message" | "severity">) => void;
  warning: (message: string, options?: Omit<Omit<Toast, "id" | "message" | "severity">, "id" | "message" | "severity">) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 4000;

const severityIcons = {
  success: CheckCircleIcon,
  error: ErrorIcon,
  info: InfoIcon,
  warning: WarningIcon,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const push = useCallback((toast: Omit<Toast, "id">) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = { ...toast, id };
    
    setToasts((prev) => {
      // Remove oldest if at max
      const updated = [...prev, newToast];
      if (updated.length > MAX_TOASTS) {
        return updated.slice(updated.length - MAX_TOASTS);
      }
      return updated;
    });

    // Auto-dismiss if not persistent
    if (!toast.persistent) {
      setTimeout(() => {
        dismiss(id);
      }, toast.duration || DEFAULT_DURATION);
    }
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = useMemo<ToastContextValue>(() => ({
    push,
    success: (message, options) => push({ message, severity: "success", ...options }),
    error: (message, options) => push({ message, severity: "error", ...options }),
    info: (message, options) => push({ message, severity: "info", ...options }),
    warning: (message, options) => push({ message, severity: "warning", ...options }),
    dismiss,
  }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 2000,
          display: "flex",
          flexDirection: "column",
          gap: 1,
          maxWidth: 400,
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast, index) => (
            <ToastItem
              key={toast.id}
              toast={toast}
              index={index}
              onDismiss={() => dismiss(toast.id)}
            />
          ))}
        </AnimatePresence>
      </Box>
    </ToastContext.Provider>
  );
}

function ToastItem({
  toast,
  index,
  onDismiss,
}: {
  toast: Toast;
  index: number;
  onDismiss: () => void;
}) {
  const [progress, setProgress] = useState(100);
  const Icon = severityIcons[toast.severity];
  const duration = toast.duration || DEFAULT_DURATION;

  useEffect(() => {
    if (toast.persistent) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    return () => clearInterval(interval);
  }, [duration, toast.persistent]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 100, scale: 0.8 }}
      transition={{
        type: "spring",
        stiffness: 500,
        damping: 30,
        delay: index * 0.05,
      }}
      style={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <Alert
        severity={toast.severity}
        variant="filled"
        icon={<Icon fontSize="small" />}
        onClose={onDismiss}
        sx={{
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
          minWidth: 300,
          maxWidth: 400,
          alignItems: "center",
          ".MuiAlert-message": {
            width: "100%",
          },
        }}
        action={
          toast.action ? (
            <Button
              color="inherit"
              size="small"
              onClick={() => {
                toast.action?.onClick();
                onDismiss();
              }}
              sx={{
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {toast.action.label}
            </Button>
          ) : undefined
        }
      >
        {toast.message}
        
        {/* Progress bar for auto-dismiss */}
        {!toast.persistent && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 3,
              bgcolor: "rgba(255,255,255,0.2)",
              "& .MuiLinearProgress-bar": {
                bgcolor: "rgba(255,255,255,0.5)",
              },
            }}
          />
        )}
      </Alert>
    </motion.div>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
