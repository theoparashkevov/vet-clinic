/**
 * VaccinationDialog
 * 
 * A modal dialog component for recording new vaccinations for a patient.
 * Provides a form with vaccine selection, type classification, dates, and notes.
 * 
 * Features:
 * - Pre-populated list of common vaccines (Rabies, DA2PP, FVRCP, etc.)
 * - Vaccine type classification (Core/Non-Core/Lifestyle)
 * - Auto-calculation of due date (1 year from administered date)
 * - Form validation with error display
 * - Loading state during submission
 * 
 * Used in: Patient detail page
 * 
 * @example
 * <VaccinationDialog
 *   open={dialogOpen}
 *   patientId="patient-123"
 *   onClose={() => setDialogOpen(false)}
 *   onCreated={() => refreshData()}
 * />
 */

"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import AppDialog from "./AppDialog";
import FormLayout from "./FormLayout";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

/** 
 * Vaccine type classifications per veterinary guidelines
 * - Core: Essential for all pets (e.g., Rabies)
 * - Non-Core: Based on risk factors (e.g., Bordetella)
 * - Lifestyle: Based on pet's activities (e.g., Lyme for outdoor dogs)
 */
const VACCINE_TYPES = [
  { value: "core", label: "Core Vaccine" },
  { value: "non-core", label: "Non-Core Vaccine" },
  { value: "lifestyle", label: "Lifestyle Vaccine" },
];

/**
 * Common vaccines list for quick selection
 * Covers most commonly administered vaccines for dogs and cats
 */
const COMMON_VACCINES = [
  "Rabies",                    // Required by law in most areas
  "DA2PP (Distemper)",        // Dogs: Distemper, Adenovirus, Parvovirus, Parainfluenza
  "FVRCP (Feline Distemper)", // Cats: Feline Viral Rhinotracheitis, Calicivirus, Panleukopenia
  "Bordetella",               // Kennel cough
  "Leptospirosis",            // Bacterial infection from water/soil
  "Lyme",                     // Tick-borne disease
  "FeLV",                     // Feline Leukemia Virus
  "FIV",                      // Feline Immunodeficiency Virus
];

/** Props for VaccinationDialog component */
type Props = {
  /** Whether the dialog is currently open */
  open: boolean;
  /** Patient ID (CUID) to associate the vaccination with */
  patientId: string;
  /** Callback when dialog is closed (Cancel button or backdrop click) */
  onClose: () => void;
  /** Callback after successful creation - parent should refresh data */
  onCreated: () => void;
};

/**
 * VaccinationDialog Component
 * 
 * Renders a form dialog for creating new vaccination records.
 * Handles form state, validation, API submission, and error handling.
 */
export default function VaccinationDialog({ open, patientId, onClose, onCreated }: Props) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Form state for vaccination data
   * All dates stored as ISO 8601 strings (YYYY-MM-DD)
   */
  const [formData, setFormData] = useState({
    name: "",           // Vaccine name
    type: "core",       // Default to core vaccines
    administeredAt: "", // Date given (YYYY-MM-DD)
    dueDate: "",        // Next due date (YYYY-MM-DD)
    notes: "",          // Optional notes
  });

  /**
   * Handle form submission
   * Validates required fields, submits to API, and handles response
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client-side validation
    if (!formData.name || !formData.administeredAt || !formData.dueDate) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Submit vaccination record to API
      await apiJson(`/v1/vaccinations/patients/${patientId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          type: formData.type,
          administeredAt: formData.administeredAt,
          dueDate: formData.dueDate,
          notes: formData.notes || undefined, // Don't send empty strings
        }),
      });

      // Success - notify parent and reset form
      toast.success("Vaccination record added successfully");
      onCreated();
      onClose();
      
      // Reset form for next use
      setFormData({
        name: "",
        type: "core",
        administeredAt: "",
        dueDate: "",
        notes: "",
      });
    } catch (e: unknown) {
      if (e instanceof AuthError) return; // Auth errors handled by API layer
      const message = e instanceof Error ? e.message : "Failed to add vaccination";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle dialog close
   * Prevents closing while submission is in progress
   */
  const handleClose = () => {
    if (!loading) {
      setError(null);
      onClose();
    }
  };

  /**
   * Auto-calculate due date helper
   * When administered date is set and due date is empty,
   * automatically sets due date to 1 year later (standard for most vaccines)
   */
  const handleAdministeredChange = (date: string) => {
    setFormData(prev => {
      const newData = { ...prev, administeredAt: date };
      if (date && !prev.dueDate) {
        const administered = new Date(date);
        const due = new Date(administered);
        due.setFullYear(due.getFullYear() + 1); // Add 1 year
        newData.dueDate = due.toISOString().split('T')[0]; // Format as YYYY-MM-DD
      }
      return newData;
    });
  };

  return (
    <AppDialog
      open={open}
      title="Add Vaccination"
      subtitle="Record a vaccination for this patient"
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      actions={
        <>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="vaccination-form"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={18} sx={{ mr: 1 }} /> : null}
            Add Vaccination
          </Button>
        </>
      }
    >
      <Box component="form" id="vaccination-form" onSubmit={handleSubmit}>
        <FormLayout error={error}>
          <TextField
            select
            label="Vaccine Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            fullWidth
          >
            {COMMON_VACCINES.map((vaccine) => (
              <MenuItem key={vaccine} value={vaccine}>
                {vaccine}
              </MenuItem>
            ))}
            <MenuItem value="">Other (type below)</MenuItem>
          </TextField>
          
          {formData.name === "" && (
            <TextField
              label="Custom Vaccine Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
              placeholder="Enter vaccine name"
            />
          )}

          <TextField
            select
            label="Vaccine Type"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            required
            fullWidth
          >
            {VACCINE_TYPES.map((type) => (
              <MenuItem key={type.value} value={type.value}>
                {type.label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Date Administered"
            type="date"
            value={formData.administeredAt}
            onChange={(e) => handleAdministeredChange(e.target.value)}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            required
            fullWidth
            InputLabelProps={{ shrink: true }}
            helperText="When is the next dose due?"
          />

          <TextField
            label="Notes"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            fullWidth
            multiline
            rows={2}
            placeholder="Batch number, reaction, etc. (optional)"
          />
        </FormLayout>
      </Box>
    </AppDialog>
  );
}
