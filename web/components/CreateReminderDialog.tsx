"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert,
  Box,
  Typography,
  FormControlLabel,
  Switch,
} from "@mui/material";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

interface Props {
  open: boolean;
  patientId: string;
  patientName: string;
  appointmentId?: string;
  onClose: () => void;
  onCreated: () => void;
}

const REMINDER_TYPES = [
  { value: "lab_results", label: "Lab Results" },
  { value: "recheck", label: "Recheck Appointment" },
  { value: "surgery_followup", label: "Surgery Follow-up" },
  { value: "medication", label: "Medication Check" },
  { value: "custom", label: "Custom Reminder" },
];

const PRIORITIES = [
  { value: "low", label: "Low" },
  { value: "normal", label: "Normal" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" },
];

export default function CreateReminderDialog({
  open,
  patientId,
  patientName,
  appointmentId,
  onClose,
  onCreated,
}: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    type: "custom",
    title: "",
    description: "",
    dueDate: getDefaultDueDate(),
    priority: "normal",
    notifyClient: false,
  });

  function getDefaultDueDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default to 1 week
    return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  }

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      const body = {
        patientId,
        appointmentId,
        type: form.type,
        title: form.title,
        description: form.description || undefined,
        dueDate: new Date(form.dueDate).toISOString(),
        priority: form.priority,
        notifyClient: form.notifyClient,
      };

      if (appointmentId) {
        await apiJson(`/v1/reminders/from-appointment/${appointmentId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      } else {
        await apiJson("/v1/reminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
      }

      toast.success("Reminder created");
      onCreated();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to create reminder";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({
      type: "custom",
      title: "",
      description: "",
      dueDate: getDefaultDueDate(),
      priority: "normal",
      notifyClient: false,
    });
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Create Follow-up Reminder
        <Typography variant="caption" display="block" color="text.secondary">
          {patientName}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        <TextField
          select
          label="Reminder Type"
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          fullWidth
        >
          {REMINDER_TYPES.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          fullWidth
          required
          placeholder="e.g., Call with lab results"
        />

        <TextField
          label="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          fullWidth
          multiline
          rows={2}
          placeholder="Additional details..."
        />

        <TextField
          select
          label="Priority"
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          fullWidth
        >
          {PRIORITIES.map((p) => (
            <MenuItem key={p.value} value={p.value}>
              {p.label}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Due Date & Time"
          type="datetime-local"
          value={form.dueDate}
          onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
          fullWidth
          InputLabelProps={{ shrink: true }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={form.notifyClient}
              onChange={(e) => setForm({ ...form, notifyClient: e.target.checked })}
            />
          }
          label="Notify client when due"
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !form.title}
        >
          {loading ? "Creating..." : "Create Reminder"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
