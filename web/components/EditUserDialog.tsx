"use client";

import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AppDialog from "./AppDialog";
import FormLayout from "./FormLayout";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

const USER_ROLES = [
  { value: "doctor", label: "Doctor" },
  { value: "staff", label: "Staff" },
  { value: "admin", label: "Admin" },
];

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Props = {
  user: User | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

export default function EditUserDialog({ user, open, onClose, onUpdated }: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "staff",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setError(null);
    setLoading(true);

    try {
      await apiJson(`/v1/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
        }),
      });

      toast.success("User updated successfully");
      onUpdated();
      onClose();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to update user";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  if (!user) return null;

  return (
    <AppDialog
      open={open}
      title="Edit User"
      subtitle={`Update ${user.name}'s information`}
      onClose={handleClose}
      maxWidth="sm"
      actions={
        <>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="edit-user-form"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Save Changes
          </Button>
        </>
      }
    >
      <Box component="form" id="edit-user-form" onSubmit={handleSubmit}>
        <FormLayout error={error}>
          <TextField
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          />
          <TextField
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            fullWidth
          />
          <TextField
            select
            label="Role"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            required
            fullWidth
          >
            {USER_ROLES.map((role) => (
              <MenuItem key={role.value} value={role.value}>
                {role.label}
              </MenuItem>
            ))}
          </TextField>
        </FormLayout>
      </Box>
    </AppDialog>
  );
}
