"use client";

import { useState } from "react";
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Button, Chip, IconButton, Alert } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";

export default function UsersAdminPage() {
  const [users, setUsers] = useState<any[]>([
    { id: "1", name: "Dr. Maria Ivanova", email: "maria@vetclinic.com", role: "doctor", active: true },
    { id: "2", name: "Staff User", email: "staff@vetclinic.com", role: "staff", active: true },
  ]);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>User Management</Typography>
      <Alert severity="info" sx={{ mb: 2 }}>Manage doctors, staff, and administrators. Reset passwords and control access.</Alert>
      <Button variant="contained" startIcon={<AddIcon />} sx={{ mb: 2 }}>Add User</Button>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow><TableCell>Name</TableCell><TableCell>Email</TableCell><TableCell>Role</TableCell><TableCell>Status</TableCell><TableCell>Actions</TableCell></TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell><Chip label={u.role} color={u.role === "doctor" ? "primary" : "default"} size="small" /></TableCell>
                <TableCell>{u.active ? <Chip label="Active" color="success" size="small" /> : <Chip label="Inactive" size="small" />}</TableCell>
                <TableCell>
                  <IconButton><EditIcon /></IconButton>
                  <IconButton><LockResetIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
}
