"use client";

import { createContext, useContext, useEffect, useCallback, useState, ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";

// Keyboard shortcut definition
type ShortcutModifier = "ctrl" | "meta" | "alt" | "shift";

interface Shortcut {
  key: string;
  modifiers?: ShortcutModifier[];
  description: string;
  action: () => void;
  scope?: "global" | "page";
}

interface KeyboardShortcutsContextValue {
  registerShortcut: (shortcut: Shortcut) => void;
  unregisterShortcut: (key: string) => void;
  shortcuts: Shortcut[];
  showHelp: boolean;
  setShowHelp: (show: boolean) => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextValue | null>(null);

export function KeyboardShortcutsProvider({ children }: { children: ReactNode }) {
  const [shortcuts, setShortcuts] = useState<Shortcut[]>([]);
  const [showHelp, setShowHelp] = useState(false);

  const registerShortcut = useCallback((shortcut: Shortcut) => {
    setShortcuts((prev) => {
      const filtered = prev.filter((s) => s.key !== shortcut.key);
      return [...filtered, shortcut];
    });
  }, []);

  const unregisterShortcut = useCallback((key: string) => {
    setShortcuts((prev) => prev.filter((s) => s.key !== key));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShowHelp(true);
        return;
      }

      if (e.key === "Escape" && showHelp) {
        setShowHelp(false);
        return;
      }

      shortcuts.forEach((shortcut) => {
        if (matchesShortcut(e, shortcut)) {
          e.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [shortcuts, showHelp]);

  return (
    <KeyboardShortcutsContext.Provider
      value={{ registerShortcut, unregisterShortcut, shortcuts, showHelp, setShowHelp }}
    >
      {children}
      <ShortcutsHelpDialog open={showHelp} onClose={() => setShowHelp(false)} shortcuts={shortcuts} />
    </KeyboardShortcutsContext.Provider>
  );
}

function matchesShortcut(e: KeyboardEvent, shortcut: Shortcut): boolean {
  const key = e.key.toLowerCase();
  const expectedKey = shortcut.key.toLowerCase();

  if (key !== expectedKey) return false;

  const modifiers = shortcut.modifiers || [];
  const hasCtrl = modifiers.includes("ctrl");
  const hasMeta = modifiers.includes("meta");
  const hasAlt = modifiers.includes("alt");
  const hasShift = modifiers.includes("shift");

  if (hasCtrl && !e.ctrlKey && !e.metaKey) return false;
  if (hasMeta && !e.metaKey && !e.ctrlKey) return false;
  if (hasAlt && !e.altKey) return false;
  if (hasShift && !e.shiftKey) return false;

  return true;
}

export function useKeyboardShortcuts() {
  const ctx = useContext(KeyboardShortcutsContext);
  if (!ctx) throw new Error("useKeyboardShortcuts must be used within KeyboardShortcutsProvider");
  return ctx;
}

export function usePageShortcuts(shortcuts: Omit<Shortcut, "scope">[]) {
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    shortcuts.forEach((shortcut) => {
      registerShortcut({ ...shortcut, scope: "page" });
    });

    return () => {
      shortcuts.forEach((shortcut) => {
        unregisterShortcut(shortcut.key);
      });
    };
  }, [registerShortcut, unregisterShortcut, shortcuts]);
}

export function useGlobalShortcuts() {
  const router = useRouter();
  const pathname = usePathname();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  useEffect(() => {
    const globalShortcuts: Shortcut[] = [
      {
        key: "k",
        modifiers: ["ctrl"],
        description: "Open Command Palette",
        action: () => {
          window.dispatchEvent(new CustomEvent("open-command-palette"));
        },
        scope: "global",
      },
      {
        key: "n",
        modifiers: ["ctrl"],
        description: "New Patient",
        action: () => {
          if (pathname === "/patients") {
            window.dispatchEvent(new CustomEvent("new-patient"));
          } else {
            router.push("/patients");
          }
        },
        scope: "global",
      },
      {
        key: "a",
        modifiers: ["ctrl"],
        description: "New Appointment",
        action: () => {
          if (pathname === "/appointments") {
            window.dispatchEvent(new CustomEvent("new-appointment"));
          } else {
            router.push("/appointments");
          }
        },
        scope: "global",
      },
      {
        key: "r",
        modifiers: ["ctrl"],
        description: "Refresh Data",
        action: () => {
          window.location.reload();
        },
        scope: "global",
      },
      {
        key: "h",
        modifiers: ["ctrl"],
        description: "Go to Home",
        action: () => router.push("/"),
        scope: "global",
      },
      {
        key: "p",
        modifiers: ["ctrl"],
        description: "Go to Patients",
        action: () => router.push("/patients"),
        scope: "global",
      },
      {
        key: "Escape",
        description: "Close Dialog / Go Back",
        action: () => {
          window.dispatchEvent(new CustomEvent("escape-pressed"));
        },
        scope: "global",
      },
    ];

    globalShortcuts.forEach((shortcut) => {
      registerShortcut(shortcut);
    });

    return () => {
      globalShortcuts.forEach((shortcut) => {
        unregisterShortcut(shortcut.key);
      });
    };
  }, [registerShortcut, unregisterShortcut, router, pathname]);
}

function ShortcutsHelpDialog({
  open,
  onClose,
  shortcuts,
}: {
  open: boolean;
  onClose: () => void;
  shortcuts: Shortcut[];
}) {
  const formatShortcut = (shortcut: Shortcut) => {
    const parts: string[] = [];
    if (shortcut.modifiers?.includes("ctrl")) parts.push("Ctrl");
    if (shortcut.modifiers?.includes("meta")) parts.push("Cmd");
    if (shortcut.modifiers?.includes("alt")) parts.push("Alt");
    if (shortcut.modifiers?.includes("shift")) parts.push("Shift");
    parts.push(shortcut.key.toUpperCase());
    return parts.join(" + ");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Keyboard Shortcuts</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Press any shortcut combination to quickly navigate or perform actions.
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Shortcut</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Scope</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {shortcuts.map((shortcut) => (
              <TableRow key={shortcut.key}>
                <TableCell>
                  <Chip
                    label={formatShortcut(shortcut)}
                    size="small"
                    variant="outlined"
                    sx={{ fontFamily: "monospace" }}
                  />
                </TableCell>
                <TableCell>{shortcut.description}</TableCell>
                <TableCell>
                  <Chip
                    label={shortcut.scope || "global"}
                    size="small"
                    color={shortcut.scope === "global" ? "primary" : "default"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </DialogContent>
    </Dialog>
  );
}
