"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Chip,
  Button,
  Alert,
} from "@mui/material";
import ScienceIcon from "@mui/icons-material/Science";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MedicationIcon from "@mui/icons-material/Medication";
import NoteIcon from "@mui/icons-material/Note";
import PeopleIcon from "@mui/icons-material/People";
import Link from "next/link";
import { apiJson } from "../../lib/api";

interface Stats {
  labPanels: number;
  labTests: number;
  vaccinationTypes: number;
  medicationTemplates: number;
  noteTemplates: number;
  users: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, just show placeholder stats
    // In a real implementation, you'd fetch these from the API
    setStats({
      labPanels: 5,
      labTests: 40,
      vaccinationTypes: 6,
      medicationTemplates: 60,
      noteTemplates: 9,
      users: 6,
    });
    setLoading(false);
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Administration Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Manage your clinic&apos;s data, templates, and settings from this central panel.
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Welcome to the Admin Panel!</strong> Here you can manage lab panels, vaccination types, 
          medication templates, note templates, and clinic settings. Changes here will be immediately available 
          to all doctors and staff using the system.
        </Typography>
      </Alert>

      <Grid container spacing={3}>
        {/* Lab Panels */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <ScienceIcon color="primary" />
                <Typography variant="h6">Lab Panels</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage available lab test panels and reference ranges for dogs and cats.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                <Chip label={`${stats?.labPanels || 0} Panels`} size="small" />
                <Chip label={`${stats?.labTests || 0} Tests`} size="small" color="primary" variant="outlined" />
              </Box>
              <Button
                variant="contained"
                fullWidth
                component={Link}
                href="/admin/lab-panels"
              >
                Manage Lab Panels
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Vaccinations */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <VaccinesIcon color="success" />
                <Typography variant="h6">Vaccination Types</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure vaccination types, schedules, and reminders for different species.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                <Chip label={`${stats?.vaccinationTypes || 0} Types`} size="small" color="success" />
              </Box>
              <Button
                variant="contained"
                fullWidth
                color="success"
                component={Link}
                href="/admin/vaccinations"
              >
                Manage Vaccinations
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Medications */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <MedicationIcon color="warning" />
                <Typography variant="h6">Medication Templates</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage prescription templates with dosages, frequencies, and instructions.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                <Chip label={`${stats?.medicationTemplates || 0} Templates`} size="small" color="warning" />
              </Box>
              <Button
                variant="contained"
                fullWidth
                color="warning"
                component={Link}
                href="/admin/medications"
              >
                Manage Medications
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Note Templates */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <NoteIcon color="info" />
                <Typography variant="h6">Note Templates</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Configure medical record note templates for common visit types.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                <Chip label={`${stats?.noteTemplates || 0} Templates`} size="small" color="info" />
              </Box>
              <Button
                variant="contained"
                fullWidth
                color="info"
                component={Link}
                href="/admin/note-templates"
              >
                Manage Templates
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Users */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%" }}>
            <CardContent>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <PeopleIcon color="secondary" />
                <Typography variant="h6">User Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Manage doctors, staff, and admin users. Reset passwords and set permissions.
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
                <Chip label={`${stats?.users || 0} Users`} size="small" color="secondary" />
              </Box>
              <Button
                variant="contained"
                fullWidth
                color="secondary"
                component={Link}
                href="/admin/users"
              >
                Manage Users
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ height: "100%", backgroundColor: "primary.light" }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Quick Actions
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                Common administrative tasks
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  href="/admin/lab-panels/new"
                  sx={{ backgroundColor: "background.paper" }}
                >
                  + Add New Lab Panel
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  href="/admin/medications/new"
                  sx={{ backgroundColor: "background.paper" }}
                >
                  + Add Medication Template
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  component={Link}
                  href="/admin/note-templates/new"
                  sx={{ backgroundColor: "background.paper" }}
                >
                  + Add Note Template
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}