"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import WarningIcon from "@mui/icons-material/Warning";
import AppDialog from "./AppDialog";
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
  onDeleted: () => void;
};

export default function DeleteUserDialog({ user, open, onClose, onDeleted }: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!user) return;

    setLoading(true);
    try {
      await apiJson(`/v1/users/${user.id}`, {
        method: "DELETE",
      });

      toast.success(`${user.name} has been deleted`);
      onDeleted();
      onClose();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to delete user";
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!user) return null;

  return (
    <AppDialog
      open={open}
      title="Delete User"
      onClose={handleClose}
      maxWidth="xs"
      actions={
        <>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleDelete}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Delete
          </Button>
        </>
      }
    >
      <Box sx={{ textAlign: "center", py: 2 }}>
        <WarningIcon color="error" sx={{ fontSize: 48, mb: 2 }} />
        <Typography variant="h6" gutterBottom>
          Are you sure?
        </Typography>
        <Typography variant="body2" color="text.secondary">
          This will permanently delete <strong>{user.name}</strong> ({user.email}).
          This action cannot be undone.
        </Typography>
      </Box>
    </AppDialog>
  );
}
