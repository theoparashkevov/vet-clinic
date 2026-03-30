"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Chip,
  Grid,
  Alert,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

interface LabPanel {
  id: string;
  name: string;
  category: string;
  description: string | null;
  isCommon: boolean;
}

interface LabTest {
  id: string;
  name: string;
  abbreviation: string | null;
  unit: string;
}

interface LabResultUploadDialogProps {
  open: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string;
  patientSpecies: string;
  onCreated: () => void;
}

export default function LabResultUploadDialog({
  open,
  onClose,
  patientId,
  patientName,
  patientSpecies,
  onCreated,
}: LabResultUploadDialogProps) {
  const toast = useToast();
  const [panels, setPanels] = useState<LabPanel[]>([]);
  const [selectedPanel, setSelectedPanel] = useState<string>("");
  const [tests, setTests] = useState<LabTest[]>([]);
  const [values, setValues] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<string>("");
  const [testDate, setTestDate] = useState<string>(new Date().toISOString().split("T")[0]);
  const [externalLab, setExternalLab] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [loadingPanels, setLoadingPanels] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      loadPanels();
    }
  }, [open, patientSpecies]);

  useEffect(() => {
    if (selectedPanel) {
      loadTests(selectedPanel);
    } else {
      setTests([]);
      setValues({});
    }
  }, [selectedPanel]);

  const loadPanels = async () => {
    try {
      setLoadingPanels(true);
      setError(null);
      const params = patientSpecies ? `?species=${encodeURIComponent(patientSpecies)}` : "";
      const data = await apiJson<LabPanel[]>(`/labs/panels${params}`);
      setPanels(data);
    } catch (err) {
      console.error("Failed to load lab panels:", err);
      if (err instanceof AuthError) return;
      setError("Failed to load lab panels");
    } finally {
      setLoadingPanels(false);
    }
  };

  const loadTests = async (panelId: string) => {
    try {
      const data = await apiJson<LabTest[]>(`/labs/panels/${panelId}/tests`);
      setTests(data);
      // Initialize values
      const initialValues: Record<string, string> = {};
      data.forEach((test) => {
        initialValues[test.id] = "";
      });
      setValues(initialValues);
    } catch (err) {
      console.error("Failed to load tests:", err);
      if (err instanceof AuthError) return;
      toast.error("Failed to load lab tests");
    }
  };

  const handleValueChange = (testId: string, value: string) => {
    setValues((prev) => ({ ...prev, [testId]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      // Filter out empty values
      const testValues = Object.entries(values)
        .filter(([_, value]) => value.trim() !== "")
        .map(([testId, value]) => ({
          testId,
          value: parseFloat(value),
        }));

      if (testValues.length === 0) {
        setError("Please enter at least one test value");
        setLoading(false);
        return;
      }

      const body = {
        panelId: selectedPanel,
        testDate,
        externalLab: externalLab || undefined,
        notes: notes || undefined,
        values: testValues,
      };

      await apiJson(`/labs/patients/${patientId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      toast.success("Lab results uploaded successfully");
      onCreated();
      handleClose();
    } catch (err) {
      console.error("Failed to upload lab results:", err);
      if (err instanceof AuthError) return;
      setError(err instanceof Error ? err.message : "Failed to upload lab results");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedPanel("");
    setTests([]);
    setValues({});
    setNotes("");
    setTestDate(new Date().toISOString().split("T")[0]);
    setExternalLab("");
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Upload Lab Results</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal" disabled={loadingPanels}>
              <InputLabel>Lab Panel *</InputLabel>
              <Select
                value={selectedPanel}
                onChange={(e) => setSelectedPanel(e.target.value)}
                label="Lab Panel *"
              >
                <MenuItem value="">
                  <em>Select a panel</em>
                </MenuItem>
                {panels.map((panel) => (
                  <MenuItem key={panel.id} value={panel.id}>
                    <Box>
                      {panel.name}
                      <Chip
                        label={panel.category}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                      {panel.isCommon && (
                        <Chip
                          label="Common"
                          size="small"
                          color="primary"
                          sx={{ ml: 0.5 }}
                        />
                      )}
                    </Box>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="normal"
              label="Test Date *"
              type="date"
              value={testDate}
              onChange={(e) => setTestDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="normal"
              label="External Lab (optional)"
              value={externalLab}
              onChange={(e) => setExternalLab(e.target.value)}
              placeholder="e.g., Antech, Idexx"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              margin="normal"
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              multiline
              rows={1}
              placeholder="Additional notes about these results"
            />
          </Grid>

          {tests.length > 0 && (
            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
                Test Values
              </Typography>
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: 2,
                }}
              >
                {tests.map((test) => (
                  <TextField
                    key={test.id}
                    label={test.name}
                    placeholder={test.abbreviation || ""}
                    value={values[test.id] || ""}
                    onChange={(e) => handleValueChange(test.id, e.target.value)}
                    type="number"
                    size="small"
                    InputProps={{
                      endAdornment: test.unit ? (
                        <Typography variant="caption" color="text.secondary">
                          {test.unit}
                        </Typography>
                      ) : null,
                    }}
                  />
                ))}
              </Box>
            </Grid>
          )}

          {tests.length === 0 && selectedPanel && (
            <Grid item xs={12}>
              <Alert severity="info">
                No tests found for this panel. The panel may be empty or still being configured.
              </Alert>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={loading || !selectedPanel}
        >
          {loading ? "Uploading..." : "Upload Results"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}