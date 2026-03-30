"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  Autocomplete,
  Box,
  Typography,
  Chip,
  Divider,
} from "@mui/material";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

interface NoteTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  isCommon: boolean;
}

interface Props {
  open: boolean;
  patientId: string;
  patientName?: string;
  patientSpecies?: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function MedicalRecordDialog({
  open,
  patientId,
  patientName,
  patientSpecies,
  onClose,
  onCreated,
}: Props) {
  const toast = useToast();
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    visitDate: new Date().toISOString().slice(0, 10),
    summary: "",
    diagnoses: "",
    treatments: "",
    prescriptions: "",
  });

  const [selectedTemplate, setSelectedTemplate] = useState<NoteTemplate | null>(null);

  // Load note templates
  useEffect(() => {
    if (!open) return;

    const loadTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const res = await apiJson<NoteTemplate[]>("/v1/note-templates");
        setTemplates(res);
      } catch (e) {
        console.error("Failed to load templates:", e);
      } finally {
        setTemplatesLoading(false);
      }
    };

    loadTemplates();
  }, [open]);

  const processTemplate = (template: NoteTemplate): string => {
    let content = template.content;

    // Replace placeholders
    if (patientName) {
      content = content.replace(/\{\{patientName\}\}/g, patientName);
    }
    if (patientSpecies) {
      content = content.replace(/\{\{species\}\}/g, patientSpecies);
    }

    // Replace current date
    content = content.replace(/\{\{date\}\}/g, new Date().toLocaleDateString());

    // Remove any remaining placeholders
    content = content.replace(/\{\{[^}]+\}\}/g, "___");

    return content;
  };

  const handleTemplateSelect = (template: NoteTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      const processedContent = processTemplate(template);
      setForm((prev) => ({
        ...prev,
        summary: processedContent,
      }));
    }
  };

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

      setForm({
        visitDate: new Date().toISOString().slice(0, 10),
        summary: "",
        diagnoses: "",
        treatments: "",
        prescriptions: "",
      });
      setSelectedTemplate(null);

      toast.success("Medical record added");
      onCreated();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to create record";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, NoteTemplate[]>);

  const sortedCategories = Object.keys(templatesByCategory).sort((a, b) => {
    const aHasCommon = templatesByCategory[a].some((t) => t.isCommon);
    const bHasCommon = templatesByCategory[b].some((t) => t.isCommon);
    if (aHasCommon && !bHasCommon) return -1;
    if (!aHasCommon && bHasCommon) return 1;
    return a.localeCompare(b);
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Medical Record</DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        {/* Template Selector */}
        <Autocomplete
          options={templates}
          groupBy={(option) => option.category}
          getOptionLabel={(option) => option.name}
          loading={templatesLoading}
          value={selectedTemplate}
          onChange={(_, value) => handleTemplateSelect(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Select from template (optional)"
              placeholder="Search templates..."
            />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="body1">{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.content.slice(0, 80)}...
                </Typography>
              </Box>
              {option.isCommon && (
                <Chip label="Common" size="small" color="primary" sx={{ ml: 1 }} />
              )}
            </li>
          )}
        />

        <Divider />

        <TextField
          label="Visit Date"
          type="date"
          required
          value={form.visitDate}
          onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="Summary *"
          required
          multiline
          rows={8}
          value={form.summary}
          onChange={(e) => setForm({ ...form, summary: e.target.value })}
          placeholder="Enter examination findings, notes, or select a template above..."
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Diagnoses"
            multiline
            rows={2}
            value={form.diagnoses}
            onChange={(e) => setForm({ ...form, diagnoses: e.target.value })}
            placeholder="Primary and secondary diagnoses..."
          />
          <TextField
            label="Treatments"
            multiline
            rows={2}
            value={form.treatments}
            onChange={(e) => setForm({ ...form, treatments: e.target.value })}
            placeholder="Treatments performed..."
          />
        </Box>

        <TextField
          label="Prescriptions"
          multiline
          rows={2}
          value={form.prescriptions}
          onChange={(e) => setForm({ ...form, prescriptions: e.target.value })}
          placeholder="Medications prescribed..."
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={submitting || !form.summary || !form.visitDate}
          onClick={handleSubmit}
        >
          {submitting ? "Saving..." : "Save Record"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
