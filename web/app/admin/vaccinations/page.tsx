"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Alert,
  Grid,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function VaccinationAdminPage() {
  const [vaccines, setVaccines] = useState<any[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<any>(null);
  const [form, setForm] = useState({ name: "", type: "Core", species: "Dog", core: true, initialDoses: 1, boosterInterval: 12, description: "" });

  useEffect(() => {
    setVaccines([
      { id: "1", name: "Rabies", type: "Core", species: "Both", core: true, initialDoses: 1, boosterInterval: 12, description: "Required by law" },
      { id: "2", name: "DA2PP", type: "Core", species: "Dog", core: true, initialDoses: 3, boosterInterval: 12, description: "Distemper, Parvo" },
      { id: "3", name: "FVRCP", type: "Core", species: "Cat", core: true, initialDoses: 3, boosterInterval: 12, description: "Feline distemper" },
    ]);
  }, []);

  const handleSave = () => {
    if (editingVaccine) {
      setVaccines(vaccines.map(v => v.id === editingVaccine.id ? { ...v, ...form } : v));
    } else {
      setVaccines([...vaccines, { id: Math.random().toString(), ...form }]);
    }
    setDialogOpen(false);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Vaccination Types Management</Typography>
      <Button variant="contained" startIcon={<AddIcon />} onClick={() => { setEditingVaccine(null); setDialogOpen(true); }} sx={{ mb: 2 }}>
        Add Vaccination Type
      </Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Species</TableCell>
              <TableCell>Doses</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {vaccines.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.name}</TableCell>
                <TableCell><Chip label={v.type} color={v.core ? "success" : "default"} size="small" /></TableCell>
                <TableCell>{v.species}</TableCell>
                <TableCell>{v.initialDoses} / {v.boosterInterval}mo</TableCell>
                <TableCell>
                  <IconButton onClick={() => { setEditingVaccine(v); setForm(v); setDialogOpen(true); }}><EditIcon /></IconButton>
                  <IconButton color="error" onClick={() => setVaccines(vaccines.filter(x => x.id !== v.id))}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingVaccine ? "Edit" : "Add"} Vaccination</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} sx={{ mb: 2, mt: 1 }} />
          <TextField select fullWidth label="Species" value={form.species} onChange={(e) => setForm({...form, species: e.target.value})} sx={{ mb: 2 }}>
            <MenuItem value="Dog">Dog</MenuItem>
            <MenuItem value="Cat">Cat</MenuItem>
            <MenuItem value="Both">Both</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
