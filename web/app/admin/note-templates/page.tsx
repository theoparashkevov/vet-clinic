"use client";

import { useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

export default function NoteTemplatesAdminPage() {
  const [templates, setTemplates] = useState<any[]>([
    { id: "1", name: "Wellness Exam - Normal", category: "Wellness", isCommon: true },
    { id: "2", name: "Sick Visit - General", category: "Sick Visit", isCommon: true },
  ]);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Note Templates</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>Manage medical record note templates for common visit types.</Alert>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }} onClick={() => setDialogOpen(true)}>Add Template</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow><TableCell>Template Name</TableCell><TableCell>Category</TableCell><TableCell>Common</TableCell><TableCell>Actions</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {templates.map((t) => (
              <TableRow key={t.id}>
                <TableCell>{t.name}</TableCell>
                <TableCell><Chip label={t.category} size="small" /></TableCell>
                <TableCell>{t.isCommon ? <Chip label="Common" color="primary" size="small" /> : "—"}</TableCell>
                <TableCell>
                  <IconButton><EditIcon /></IconButton>
                  <IconButton color="error"><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
NOTEEEOF
