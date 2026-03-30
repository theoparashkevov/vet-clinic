"use client";

import { useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function MedicationsAdminPage() {
  const [medications, setMedications] = useState<any[]>([
    { id: "1", name: "Amoxicillin 250mg", category: "Antibiotic", dosage: "1 tablet", frequency: "Twice daily", duration: "7 days", isCommon: true },
    { id: "2", name: "Carprofen 75mg", category: "NSAID", dosage: "1 tablet", frequency: "Once daily", duration: "5-7 days", isCommon: true },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMed, setEditingMed] = useState<any>(null);
  const [form, setForm] = useState({ name: "", category: "Antibiotic", dosage: "", frequency: "", duration: "", instructions: "", isCommon: true });

  const handleSave = () => {
    if (editingMed) {
      setMedications(medications.map(m => m.id === editingMed.id ? { ...m, ...form } : m));
    } else {
      setMedications([...medications, { id: Math.random().toString(), ...form }]);
    }
    setDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Medication Templates</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>Manage prescription templates with dosages and instructions.</Alert>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingMed(null); setDialogOpen(true); }} sx={{ mb: 2 }}>
        Add Template
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow><TableCell>Name</TableCell><TableCell>Category</TableCell><TableCell>Dosage</TableCell><TableCell>Common</TableCell><TableCell>Actions</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {medications.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.name}</TableCell>
                <TableCell><Chip label={m.category} size="small" /></TableCell>
                <TableCell>{m.dosage}</TableCell>
                <TableCell>{m.isCommon ? <Chip label="Common" color="primary" size="small" /> : "—"}</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditingMed(m); setForm(m); setDialogOpen(true); }}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setMedications(medications.filter(x => x.id !== m.id))}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingMed ? "Edit" : "Add"} Medication Template</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} sx={{ mb: 2, mt: 1 }} />
          <TextField fullWidth label="Category" value={form.category} onChange={(e) => setForm({...form, category: e.target.value})} sx={{ mb: 2 }} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
