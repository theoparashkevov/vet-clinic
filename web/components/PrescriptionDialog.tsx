"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Alert,
  AlertTitle,
  Autocomplete,
  Chip,
  Box,
  Typography,
  Switch,
  FormControlLabel,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import WarningIcon from "@mui/icons-material/Warning";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

interface MedicationTemplate {
  id: string;
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  isCommon: boolean;
}

interface Prescription {
  id: string;
  medication: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  refillsTotal: number;
  refillsRemaining: number;
  expiresAt: string;
  isControlled: boolean;
  veterinarian: string;
  notes?: string;
  prescribedAt: string;
}

interface Props {
  open: boolean;
  patientId: string;
  patientName: string;
  ownerName: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function PrescriptionDialog({
  open,
  patientId,
  patientName,
  ownerName,
  onClose,
  onCreated,
}: Props) {
  const toast = useToast();
  const [templates, setTemplates] = useState<MedicationTemplate[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(false);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);

  const [form, setForm] = useState({
    medication: "",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    refillsTotal: 0,
    expiresAt: getDefaultExpiration(),
    isControlled: false,
    notes: "",
    veterinarian: "",
  });

  const [selectedTemplate, setSelectedTemplate] = useState<MedicationTemplate | null>(null);

  function getDefaultExpiration(): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString().slice(0, 10);
  }

  // Load templates and existing prescriptions
  useEffect(() => {
    if (!open) return;

    const loadData = async () => {
      setTemplatesLoading(true);
      try {
        // Load templates
        const templatesRes = await apiJson<MedicationTemplate[]>("/v1/medication-templates");
        setTemplates(templatesRes);

        // Load existing prescriptions for this patient
        const prescriptionsRes = await apiJson<Prescription[]>(`/v1/patients/${patientId}/prescriptions`);
        setPrescriptions(prescriptionsRes);
      } catch (e) {
        console.error("Failed to load templates:", e);
      } finally {
        setTemplatesLoading(false);
      }
    };

    loadData();
  }, [open, patientId]);

  // Check drug interactions when medication changes
  const checkInteractions = useCallback(
    async (medication: string) => {
      if (!medication || medication.length < 3) {
        setWarnings([]);
        return;
      }

      try {
        const warnings = await apiJson<string[]>(
          `/v1/patients/${patientId}/prescriptions/check-interactions?medication=${encodeURIComponent(medication)}`
        );
        setWarnings(warnings);
      } catch (e) {
        console.error("Failed to check interactions:", e);
      }
    },
    [patientId]
  );

  // Debounce interaction checking
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (form.medication) {
        checkInteractions(form.medication);
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [form.medication, checkInteractions]);

  const handleTemplateSelect = (template: MedicationTemplate | null) => {
    setSelectedTemplate(template);
    if (template) {
      setForm((prev) => ({
        ...prev,
        medication: template.name,
        dosage: template.dosage,
        frequency: template.frequency,
        duration: template.duration,
        instructions: template.instructions || "",
      }));
    }
  };

  const handleSubmit = async () => {
    if (warnings.some((w) => w.includes("ALLERGY"))) {
      const confirm = window.confirm(
        "⚠️ WARNING: This patient has an allergy to this medication!\n\nAre you sure you want to proceed?"
      );
      if (!confirm) return;
    }

    setLoading(true);
    setError(null);

    try {
      await apiJson(`/v1/patients/${patientId}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          expiresAt: new Date(form.expiresAt).toISOString(),
        }),
      });

      toast.success("Prescription created");
      onCreated();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to create prescription";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const printContent = `
      <html>
        <head>
          <title>Prescription - ${patientName}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; max-width: 600px; margin: 0 auto; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .clinic-name { font-size: 24px; font-weight: bold; }
            .label { font-weight: bold; display: inline-block; width: 120px; }
            .field { margin: 10px 0; }
            .rx-symbol { font-size: 48px; color: #333; margin-bottom: 20px; }
            .footer { margin-top: 60px; border-top: 1px solid #ccc; padding-top: 20px; }
            .signature-line { border-bottom: 1px solid #000; width: 300px; margin-top: 40px; }
            .controlled { color: #d32f2f; font-weight: bold; border: 2px solid #d32f2f; padding: 5px 10px; display: inline-block; margin: 10px 0; }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="clinic-name">🐾 Vet Clinic</div>
            <div>123 Main Street | (555) 123-4567</div>
          </div>
          
          <div class="rx-symbol">℞</div>
          
          <div class="field"><span class="label">Date:</span> ${new Date().toLocaleDateString()}</div>
          <div class="field"><span class="label">Patient:</span> ${patientName}</div>
          <div class="field"><span class="label">Owner:</span> ${ownerName}</div>
          
          <hr style="margin: 20px 0;" />
          
          <div class="field"><span class="label">Medication:</span> ${form.medication}</div>
          <div class="field"><span class="label">Dosage:</span> ${form.dosage}</div>
          <div class="field"><span class="label">Frequency:</span> ${form.frequency}</div>
          <div class="field"><span class="label">Duration:</span> ${form.duration}</div>
          
          ${form.instructions ? `<div class="field"><span class="label">Instructions:</span> ${form.instructions}</div>` : ""}
          
          ${form.refillsTotal > 0 ? `<div class="field"><span class="label">Refills:</span> ${form.refillsTotal}</div>` : ""}
          
          ${form.isControlled ? '<div class="controlled">⚠️ CONTROLLED SUBSTANCE</div>' : ""}
          
          ${form.notes ? `<div style="margin-top: 20px; font-style: italic;">Notes: ${form.notes}</div>` : ""}
          
          <div class="footer">
            <div class="signature-line"></div>
            <div style="margin-top: 10px;">Dr. ${form.veterinarian || "Veterinarian"}</div>
            <div style="margin-top: 20px; font-size: 12px; color: #666;">
              Prescription expires: ${new Date(form.expiresAt).toLocaleDateString()}
            </div>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Group templates by category
  const templatesByCategory = templates.reduce((acc, template) => {
    if (!acc[template.category]) acc[template.category] = [];
    acc[template.category].push(template);
    return acc;
  }, {} as Record<string, MedicationTemplate[]>);

  // Sort categories and put common ones first
  const sortedCategories = Object.keys(templatesByCategory).sort((a, b) => {
    const aHasCommon = templatesByCategory[a].some((t) => t.isCommon);
    const bHasCommon = templatesByCategory[b].some((t) => t.isCommon);
    if (aHasCommon && !bHasCommon) return -1;
    if (!aHasCommon && bHasCommon) return 1;
    return a.localeCompare(b);
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        Create Prescription
        <Typography variant="caption" display="block" color="text.secondary">
          {patientName} • {ownerName}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {error && <Alert severity="error">{error}</Alert>}

        {warnings.length > 0 && (
          <Alert severity="warning" icon={<WarningIcon />}>
            <AlertTitle>Drug Safety Warnings</AlertTitle>
            <ul style={{ margin: "8px 0", paddingLeft: 20 }}>
              {warnings.map((w, i) => (
                <li key={i}>{w}</li>
              ))}
            </ul>
          </Alert>
        )}

        {/* Template Selector */}
        <Autocomplete
          options={templates}
          groupBy={(option) => option.category}
          getOptionLabel={(option) => option.name}
          loading={templatesLoading}
          value={selectedTemplate}
          onChange={(_, value) => handleTemplateSelect(value)}
          renderInput={(params) => (
            <TextField {...params} label="Select from template (optional)" placeholder="Search medications..." />
          )}
          renderOption={(props, option) => (
            <li {...props}>
              <Box>
                <Typography variant="body1">{option.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {option.dosage} • {option.frequency} • {option.duration}
                </Typography>
              </Box>
              {option.isCommon && (
                <Chip label="Common" size="small" color="primary" sx={{ ml: "auto" }} />
              )}
            </li>
          )}
        />

        <Divider />

        {/* Medication Details */}
        <TextField
          label="Medication *"
          value={form.medication}
          onChange={(e) => setForm({ ...form, medication: e.target.value })}
          fullWidth
          required
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Dosage *"
            value={form.dosage}
            onChange={(e) => setForm({ ...form, dosage: e.target.value })}
            placeholder="e.g., 75mg tablet"
            required
          />
          <TextField
            label="Frequency *"
            value={form.frequency}
            onChange={(e) => setForm({ ...form, frequency: e.target.value })}
            placeholder="e.g., Once daily"
            required
          />
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Duration *"
            value={form.duration}
            onChange={(e) => setForm({ ...form, duration: e.target.value })}
            placeholder="e.g., 14 days"
            required
          />
          <TextField
            label="Expiration Date *"
            type="date"
            value={form.expiresAt}
            onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
            InputLabelProps={{ shrink: true }}
            required
          />
        </Box>

        <TextField
          label="Instructions"
          value={form.instructions}
          onChange={(e) => setForm({ ...form, instructions: e.target.value })}
          multiline
          rows={2}
          placeholder="Special instructions for the client..."
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
          <TextField
            label="Refills Allowed"
            type="number"
            value={form.refillsTotal}
            onChange={(e) =>
              setForm({ ...form, refillsTotal: Math.max(0, parseInt(e.target.value) || 0) })
            }
            InputProps={{ inputProps: { min: 0, max: 99 } }}
          />
          <FormControlLabel
            control={
              <Switch
                checked={form.isControlled}
                onChange={(e) => setForm({ ...form, isControlled: e.target.checked })}
              />
            }
            label="Controlled Substance"
          />
        </Box>

        <TextField
          label="Internal Notes"
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          multiline
          rows={2}
          placeholder="Notes for staff only..."
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Tooltip title="Print prescription">
          <IconButton onClick={handlePrint} disabled={!form.medication} color="primary">
            <PrintIcon />
          </IconButton>
        </Tooltip>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !form.medication || !form.dosage || !form.frequency || !form.duration}
        >
          {loading ? "Saving..." : "Create Prescription"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
