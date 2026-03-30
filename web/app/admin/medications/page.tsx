"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { apiJson } from "../../../lib/api";
import { useToast } from "../../../components/ToastProvider";
import CsvUploadDialog from "../../../components/CsvUploadDialog";
import type { CsvColumn } from "../../../components/CsvUploadDialog";
import { EmptyMedications } from "../../../components/EmptyStates";
import { TableSkeleton } from "../../../components/skeletons";

interface MedicationTemplate {
  id: string;
  name: string;
  category: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string | null;
  isCommon: boolean;
}

const CATEGORIES = ["Antibiotic", "NSAID", "Pain Relief", "Anti-inflammatory", "Antihistamine", "Antifungal", "Antiparasitic", "Vaccine", "Supplement", "Other"];

export default function MedicationsAdminPage() {
  const toast = useToast();
  const [medications, setMedications] = useState<MedicationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<MedicationTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Antibiotic",
    dosage: "",
    frequency: "",
    duration: "",
    instructions: "",
    isCommon: true,
  });

  // CSV Upload
  const [csvOpen, setCsvOpen] = useState(false);
  const csvColumns: CsvColumn[] = [
    { key: "name", label: "Name", required: true, description: "Medication name (e.g., Amoxicillin 250mg)" },
    { key: "category", label: "Category", description: "Antibiotic, NSAID, Pain Relief, etc." },
    { key: "dosage", label: "Dosage", description: "e.g., 1 tablet, 5mg/kg" },
    { key: "frequency", label: "Frequency", description: "e.g., Twice daily, Once daily" },
    { key: "duration", label: "Duration", description: "e.g., 7 days, 14 days" },
    { key: "instructions", label: "Instructions" },
    { key: "isCommon", label: "Common", type: "boolean", description: "true/false" },
  ];

  useEffect(() => {
    loadMedications();
  }, []);

  const loadMedications = async () => {
    try {
      setLoading(true);
      const data = await apiJson<MedicationTemplate[]>("/v1/medication-templates");
      setMedications(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load medications");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name) {
      toast.error("Medication name is required");
      return;
    }

    try {
      setSaving(true);
      if (editingMed) {
        await apiJson(`/v1/medication-templates/${editingMed.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Medication template updated");
      } else {
        await apiJson("/v1/medication-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Medication template created");
      }
      setDialogOpen(false);
      setEditingMed(null);
      setForm({ name: "", category: "Antibiotic", dosage: "", frequency: "", duration: "", instructions: "", isCommon: true });
      loadMedications();
    } catch (e: any) {
      toast.error(e.message || "Failed to save medication");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this medication template?")) return;
    try {
      await apiJson(`/v1/medication-templates/${id}`, { method: "DELETE" });
      toast.success("Medication template deleted");
      loadMedications();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete medication");
    }
  };

  const handleUploadCsv = async (data: Record<string, any>[]) => {
    const res = await apiJson("/v1/import/medication-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    loadMedications();
    return res as { success: number; errors: number; messages: string[] };
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Medication Templates</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>Manage prescription templates with dosages and instructions.</Alert>

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingMed(null); setDialogOpen(true); }}>
          Add Template
        </Button>
        <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setCsvOpen(true)}>
          Import from CSV
        </Button>
      </Box>

      {loading ? (
        <TableSkeleton rows={5} columns={6} />
      ) : medications.length === 0 ? (
        <EmptyMedications onAdd={() => { setEditingMed(null); setDialogOpen(true); }} />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Dosage</TableCell>
                <TableCell>Frequency</TableCell>
                <TableCell>Common</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {medications.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>{m.name}</TableCell>
                  <TableCell><Chip label={m.category} size="small" /></TableCell>
                  <TableCell>{m.dosage}</TableCell>
                  <TableCell>{m.frequency}</TableCell>
                  <TableCell>{m.isCommon ? <Chip label="Common" color="primary" size="small" /> : "—"}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => { setEditingMed(m); setForm({ ...m, instructions: m.instructions || "" }); setDialogOpen(true); }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(m.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMed ? "Edit" : "Add"} Medication Template</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} sx={{ mb: 2, mt: 1 }} />
          <TextField select fullWidth label="Category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} sx={{ mb: 2 }}>
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>{cat}</MenuItem>
            ))}
          </TextField>
          <TextField fullWidth label="Dosage *" value={form.dosage} onChange={(e) => setForm({...form, dosage: e.target.value})} sx={{ mb: 2 }} placeholder="e.g., 1 tablet" />
          <TextField fullWidth label="Frequency *" value={form.frequency} onChange={(e) => setForm({...form, frequency: e.target.value})} sx={{ mb: 2 }} placeholder="e.g., Twice daily" />
          <TextField fullWidth label="Duration *" value={form.duration} onChange={(e) => setForm({...form, duration: e.target.value})} sx={{ mb: 2 }} placeholder="e.g., 7 days" />
          <TextField fullWidth multiline rows={2} label="Instructions" value={form.instructions} onChange={(e) => setForm({...form, instructions: e.target.value})} sx={{ mb: 2 }} />
          <TextField select fullWidth label="Common Template" value={form.isCommon ? "true" : "false"} onChange={(e) => setForm({...form, isCommon: e.target.value === "true"})}>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name || !form.dosage}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <CsvUploadDialog
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Import Medication Templates"
        description="Upload a CSV file with medication templates. Templates will be matched by name and updated if they already exist."
        columns={csvColumns}
        onUpload={handleUploadCsv}
        onSuccess={loadMedications}
        templateFileName="medication-templates-template.csv"
      />
    </Box>
  );
}
