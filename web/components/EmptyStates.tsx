"use client";

import { Box, Typography, Button, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import PetsIcon from "@mui/icons-material/Pets";
import EventIcon from "@mui/icons-material/Event";
import ScienceIcon from "@mui/icons-material/Science";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MedicationIcon from "@mui/icons-material/Medication";
import NoteIcon from "@mui/icons-material/Note";
import PeopleIcon from "@mui/icons-material/People";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  secondaryAction,
}: EmptyStateProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 6,
        textAlign: "center",
        border: "2px dashed",
        borderColor: "divider",
        borderRadius: 3,
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          bgcolor: "primary.light",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mx: "auto",
          mb: 3,
          color: "primary.main",
        }}
      >
        {icon || <FolderOpenIcon sx={{ fontSize: 40 }} />}
      </Box>

      <Typography variant="h5" fontWeight={600} gutterBottom>
        {title}
      </Typography>

      {description && (
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 400, mx: "auto", mb: 3 }}>
          {description}
        </Typography>
      )}

      <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
        {action && (
          <Button
            variant="contained"
            startIcon={action.icon || <AddIcon />}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}

        {secondaryAction && (
          <Button variant="outlined" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
      </Box>
    </Paper>
  );
}

// Pre-built empty states for common scenarios

export function EmptyPatients({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<PetsIcon sx={{ fontSize: 40 }} />}
      title="No patients yet"
      description="Get started by adding your first patient to the system. You can track their medical history, appointments, and treatments."
      action={{
        label: "Add Patient",
        onClick: onAdd,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptyAppointments({ onSchedule }: { onSchedule: () => void }) {
  return (
    <EmptyState
      icon={<EventIcon sx={{ fontSize: 40 }} />}
      title="No appointments scheduled"
      description="Schedule appointments to manage your clinic's daily schedule and track patient visits."
      action={{
        label: "Schedule Appointment",
        onClick: onSchedule,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptySearch({ searchTerm, onClear }: { searchTerm: string; onClear: () => void }) {
  return (
    <EmptyState
      icon={<SearchIcon sx={{ fontSize: 40 }} />}
      title="No results found"
      description={`We couldn't find any matches for "${searchTerm}". Try adjusting your search terms or filters.`}
      action={{
        label: "Clear Search",
        onClick: onClear,
        icon: <SearchIcon />,
      }}
    />
  );
}

export function EmptyLabPanels({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<ScienceIcon sx={{ fontSize: 40 }} />}
      title="No lab panels configured"
      description="Lab panels define the tests available when recording lab results. Set up panels for blood work, urinalysis, and more."
      action={{
        label: "Add Lab Panel",
        onClick: onAdd,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptyVaccinations({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<VaccinesIcon sx={{ fontSize: 40 }} />}
      title="No vaccination types"
      description="Configure vaccination types to track immunization schedules for different species."
      action={{
        label: "Add Vaccination Type",
        onClick: onAdd,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptyMedications({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<MedicationIcon sx={{ fontSize: 40 }} />}
      title="No medication templates"
      description="Create medication templates with dosages and instructions to speed up prescription writing."
      action={{
        label: "Add Template",
        onClick: onAdd,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptyNoteTemplates({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<NoteIcon sx={{ fontSize: 40 }} />}
      title="No note templates"
      description="Create templates for common visit types to save time when writing medical records."
      action={{
        label: "Add Template",
        onClick: onAdd,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptyUsers({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<PeopleIcon sx={{ fontSize: 40 }} />}
      title="No users added"
      description="Add doctors, staff members, and administrators to give them access to the clinic system."
      action={{
        label: "Add User",
        onClick: onAdd,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptyReminders() {
  return (
    <EmptyState
      icon={<NotificationsNoneIcon sx={{ fontSize: 40 }} />}
      title="No reminders"
      description="You're all caught up! Reminders will appear here when you have follow-ups or tasks to complete."
    />
  );
}

export function EmptyMedicalRecords({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<NoteIcon sx={{ fontSize: 40 }} />}
      title="No medical records"
      description="Start documenting patient visits to build a complete medical history."
      action={{
        label: "Add Record",
        onClick: onAdd,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptyPhotos({ onUpload }: { onUpload: () => void }) {
  return (
    <EmptyState
      icon={<FolderOpenIcon sx={{ fontSize: 40 }} />}
      title="No photos uploaded"
      description="Upload photos to document conditions, wounds, or other clinical observations."
      action={{
        label: "Upload Photo",
        onClick: onUpload,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptyLabResults({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<ScienceIcon sx={{ fontSize: 40 }} />}
      title="No lab results"
      description="Lab results will appear here once you add them. Track trends and reference ranges over time."
      action={{
        label: "Add Lab Results",
        onClick: onAdd,
        icon: <AddIcon />,
      }}
    />
  );
}

export function EmptyPrescriptions({ onAdd }: { onAdd: () => void }) {
  return (
    <EmptyState
      icon={<MedicationIcon sx={{ fontSize: 40 }} />}
      title="No prescriptions"
      description="Prescriptions will appear here. Create prescriptions with drug interaction checking and dosage calculations."
      action={{
        label: "Add Prescription",
        onClick: onAdd,
        icon: <AddIcon />,
      }}
    />
  );
}
