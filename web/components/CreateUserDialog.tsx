"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
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

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateUserDialog({ open, onClose, onCreated }: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "staff",
    password: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await apiJson("/v1/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          role: formData.role,
          password: formData.password,
        }),
      });

      toast.success("User created successfully");
      onCreated();
      onClose();
      setFormData({
        name: "",
        email: "",
        role: "staff",
        password: "",
        confirmPassword: "",
      });
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to create user";
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

  return (
    <AppDialog
      open={open}
      title="Create User"
      subtitle="Add a new staff member or administrator"
      onClose={handleClose}
      maxWidth="sm"
      actions={
        <>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="create-user-form"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Create User
          </Button>
        </>
      }
    >
      <Box component="form" id="create-user-form" onSubmit={handleSubmit}>
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
          <TextField
            label="Password"
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
            fullWidth
            helperText="Minimum 6 characters"
          />
          <TextField
            label="Confirm Password"
            type="password"
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            required
            fullWidth
          />
        </FormLayout>
      </Box>
    </AppDialog>
  );
}
