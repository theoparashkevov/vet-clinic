"use client";

import { useState, useEffect } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert, CircularProgress } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { apiJson } from "../../../lib/api";
import { useToast } from "../../../components/ToastProvider";
import CsvUploadDialog from "../../../components/CsvUploadDialog";
import type { CsvColumn } from "../../../components/CsvUploadDialog";

interface NoteTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  isCommon: boolean;
}

export default function NoteTemplatesAdminPage() {
  const toast = useToast();
  const [templates, setTemplates] = useState<NoteTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", category: "General", content: "", isCommon: true });

  // CSV Upload
  const [csvOpen, setCsvOpen] = useState(false);
  const csvColumns: CsvColumn[] = [
    { key: "name", label: "Name", required: true, description: "Template name (e.g., Wellness Exam - Normal)" },
    { key: "category", label: "Category", description: "Wellness, Sick Visit, Surgery, etc." },
    { key: "content", label: "Content", required: true, description: "Full template content. Use {{patientName}} for placeholders." },
    { key: "isCommon", label: "Common", type: "boolean", description: "true/false" },
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await apiJson<NoteTemplate[]>("/v1/note-templates");
      setTemplates(data);
    } catch (e: any) {
      toast.error(e.message || "Failed to load templates");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!form.name || !form.content) {
      toast.error("Name and content are required");
      return;
    }

    try {
      setSaving(true);
      if (editingTemplate) {
        await apiJson(`/v1/note-templates/${editingTemplate.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Note template updated");
      } else {
        await apiJson("/v1/note-templates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        toast.success("Note template created");
      }
      setDialogOpen(false);
      setEditingTemplate(null);
      setForm({ name: "", category: "General", content: "", isCommon: true });
      loadTemplates();
    } catch (e: any) {
      toast.error(e.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this note template?")) return;
    try {
      await apiJson(`/v1/note-templates/${id}`, { method: "DELETE" });
      toast.success("Note template deleted");
      loadTemplates();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete template");
    }
  };

  const handleUploadCsv = async (data: Record<string, any>[]) => {
    const res = await apiJson("/v1/import/note-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    loadTemplates();
    return res as { success: number; errors: number; messages: string[] };
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Note Templates</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>Manage medical record note templates for common visit types.</Alert>

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingTemplate(null); setDialogOpen(true); }}>
          Add Template
        </Button>
        <Button variant="outlined" startIcon={<CloudUploadIcon />} onClick={() => setCsvOpen(true)}>
          Import from CSV
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Template Name</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Common</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>{t.name}</TableCell>
                  <TableCell><Chip label={t.category} size="small" /></TableCell>
                  <TableCell>{t.isCommon ? <Chip label="Common" color="primary" size="small" /> : "—"}</TableCell>
                  <TableCell>
                    <IconButton onClick={() => { setEditingTemplate(t); setForm({ ...t }); setDialogOpen(true); }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDelete(t.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTemplate ? "Edit" : "Add"} Note Template</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name *" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} sx={{ mb: 2, mt: 1 }} />
          <TextField fullWidth label="Category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} sx={{ mb: 2 }} />
          <TextField fullWidth multiline rows={8} label="Content *" value={form.content} onChange={(e) => setForm({...form, content: e.target.value})} sx={{ mb: 2 }} placeholder="Template content. Use {{patientName}}, {{species}}, {{date}} for placeholders." />
          <TextField select fullWidth label="Common Template" value={form.isCommon ? "true" : "false"} onChange={(e) => setForm({...form, isCommon: e.target.value === "true"})}>
            <MenuItem value="true">Yes</MenuItem>
            <MenuItem value="false">No</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving || !form.name || !form.content}>
            {saving ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <CsvUploadDialog
        open={csvOpen}
        onClose={() => setCsvOpen(false)}
        title="Import Note Templates"
        description="Upload a CSV file with note templates. Use {{patientName}}, {{species}}, {{date}} as placeholders in content."
        columns={csvColumns}
        onUpload={handleUploadCsv}
        onSuccess={loadTemplates}
        templateFileName="note-templates-template.csv"
      />
    </Box>
  );
}
