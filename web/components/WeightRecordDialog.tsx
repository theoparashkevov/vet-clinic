"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AppDialog from "./AppDialog";
import FormLayout from "./FormLayout";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

type Props = {
  open: boolean;
  patientId: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function WeightRecordDialog({ open, patientId, onClose, onCreated }: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    weight: "",
    date: new Date().toISOString().split('T')[0],
    notes: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const weight = parseFloat(formData.weight);
    if (isNaN(weight) || weight <= 0) {
      setError("Please enter a valid weight");
      return;
    }

    setLoading(true);
    try {
      await apiJson(`/v1/weight/patients/${patientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight,
          date: formData.date,
          notes: formData.notes || undefined,
        }),
      });

      toast.success("Weight recorded successfully");
      onCreated();
      onClose();
      setFormData({
        weight: "",
        date: new Date().toISOString().split('T')[0],
        notes: "",
      });
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to record weight";
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
      title="Record Weight"
      subtitle="Add a new weight measurement for this patient"
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="weight-form"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Record Weight
          </Button>
        </>
      }
    >
      <Box component="form" id="weight-form" onSubmit={handleSubmit}>
        <FormLayout error={error}>
          <TextField
            label="Weight (kg)"
            type="number"
            inputProps={{ step: 0.1, min: 0 }}
            value={formData.weight}
            onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
            required
            fullWidth
            autoFocus
          />

          <TextField
            label="Date"
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="Condition, feeding changes, etc. (optional)"
          />
        </FormLayout>
      </Box>
    </AppDialog>
  );
}
