"use client";

import { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { apiJson } from "../lib/api";

type Props = {
  open: boolean;
  patientId: string;
  onClose: () => void;
  onCreated: () => void;
};

export default function MedicalRecordDialog({ open, patientId, onClose, onCreated }: Props) {
  const [form, setForm] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    summary: "",
    diagnoses: "",
    treatments: "",
    prescriptions: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, string> = {
        visitDate: new Date(form.visitDate).toISOString(),
        summary: form.summary,
      };
      if (form.diagnoses) body.diagnoses = form.diagnoses;
      if (form.treatments) body.treatments = form.treatments;
      if (form.prescriptions) body.prescriptions = form.prescriptions;

      await apiJson(`/v1/patients/${patientId}/medical-records`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setForm({ visitDate: new Date().toISOString().slice(0, 10), summary: "", diagnoses: "", treatments: "", prescriptions: "" });
      onCreated();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to create record");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Medical Record</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
        {error && <Alert severity="error">{error}</Alert>}
        <TextField
          label="Visit Date"
          type="date"
          required
          value={form.visitDate}
          onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Summary"
          required
          multiline
          rows={3}
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
        />
        <TextField
          label="Diagnoses"
          multiline
          rows={2}
          value={form.diagnoses}
          onChange={(e) => setForm({ ...form, diagnoses: e.target.value })}
        />
        <TextField
          label="Treatments"
          multiline
          rows={2}
          value={form.treatments}
          onChange={(e) => setForm({ ...form, treatments: e.target.value })}
        />
        <TextField
          label="Prescriptions"
          multiline
          rows={2}
          value={form.prescriptions}
          onChange={(e) => setForm({ ...form, prescriptions: e.target.value })}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={submitting || !form.summary || !form.visitDate}
          onClick={handleSubmit}
        >
          {submitting ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
