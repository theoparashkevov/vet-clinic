"use client";

import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { ReactNode, FormEvent } from "react";

type Props = {
  children: ReactNode;
  error?: string | null;
  onSubmit?: (e: FormEvent) => void;
  submitLabel?: string;
  onCancel?: () => void;
  cancelLabel?: string;
  loading?: boolean;
  actions?: ReactNode;
};

export default function FormLayout({
  children,
  error,
  onSubmit,
  submitLabel = "Save",
  onCancel,
  cancelLabel = "Cancel",
  loading = false,
  actions,
}: Props) {
  const content = (
    <Stack spacing={2}>
      {error && <Alert severity="error">{error}</Alert>}
      {children}
    </Stack>
  );

  if (!onSubmit) {
    return content;
  }

  return (
    <form onSubmit={onSubmit}>
      {content}
      <Stack direction="row" spacing={1} justifyContent="flex-end" sx={{ mt: 3 }}>
        {actions}
        {onCancel && (
          <Button onClick={onCancel} disabled={loading}>
            {cancelLabel}
          </Button>
        )}
        <Button type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
          {submitLabel}
        </Button>
      </Stack>
    </form>
  );
}
