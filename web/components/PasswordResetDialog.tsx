"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import AppDialog from "./AppDialog";
import FormLayout from "./FormLayout";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

type User = {
  id: string;
  name: string;
  email: string;
};

type Props = {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onReset: () => void;
};

export default function PasswordResetDialog({ user, open, onClose, onReset }: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiJson(`/v1/users/${user.id}/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword }),
      });

      toast.success(`Password reset for ${user.name}`);
      onReset();
      onClose();
      setNewPassword("");
      setConfirmPassword("");
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to reset password";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      setNewPassword("");
      setConfirmPassword("");
      onClose();
    }
  };

  if (!user) return null;

  return (
    <AppDialog
      open={open}
      title="Reset Password"
      onClose={handleClose}
      maxWidth="xs"
      actions={
        <>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="reset-password-form"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Reset Password
          </Button>
        </>
      }
    >
      <Box component="form" id="reset-password-form" onSubmit={handleSubmit}>
        <FormLayout error={error}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Set a new password for <strong>{user.name}</strong> ({user.email})
          </Typography>
          <TextField
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            fullWidth
            helperText="Minimum 6 characters"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            fullWidth
          />
        </FormLayout>
      </Box>
    </AppDialog>
  );
}
