"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
} from "@mui/material";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

interface LabPanel {
  id: string;
  name: string;
  category: string;
  tests: LabTest[];
}

interface LabTest {
  id: string;
  name: string;
  abbreviation: string | null;
  unit: string;
  refRangeDogMin: number | null;
  refRangeDogMax: number | null;
  refRangeCatMin: number | null;
  refRangeCatMax: number | null;
}

interface Props {
  open: boolean;
  patientId: string;
  patientName: string;
  patientSpecies: string;
  onClose: () => void;
  onCreated: () => void;
}

export default function LabResultUploadDialog({
  open,
  patientId,
  patientName,
  patientSpecies,
  onClose,
  onCreated,
}: Props) {
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [panels, setPanels] = useState<LabPanel[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectedPanel, setSelectedPanel] = useState<LabPanel | null>(null);
  const [testDate, setTestDate] = useState(new Date().toISOString().slice(0, 10));
  const [externalLab, setExternalLab] = useState("");
  const [values, setValues] = useState<Record<string, number>>({});
  const [notes, setNotes] = useState("");

  const steps = ["Select Panel", "Enter Results", "Review & Save"];

  useEffect(() => {
    if (open) {
      loadPanels();
    }
  }, [open, patientSpecies]);

  const loadPanels = async () => {
    setLoading(true);
    try {
      const res = await apiJson<LabPanel[]>(`/v1/labs/panels?species=${patientSpecies}`);
      setPanels(res);
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      setError("Failed to load lab panels");
    } finally {
      setLoading(false);
    }
  };

  const getRefRange = (test: LabTest) => {
    if (patientSpecies === "Dog" || patientSpecies === "dog") {
      return { min: test.refRangeDogMin, max: test.refRangeDogMax };
    }
    return { min: test.refRangeCatMin, max: test.refRangeCatMax };
  };

  const calculateStatus = (value: number, test: LabTest): string => {
    const { min, max } = getRefRange(test);
    if (min !== null && value < min) return "low";
    if (max !== null && value > max) return "high";
    return "normal";
  };

  const handleNext = () => {
    if (activeStep === 0 && !selectedPanel) {
      setError("Please select a lab panel");
      return;
    }
    setError(null);
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!selectedPanel) return;

    setSubmitting(true);
    setError(null);

    try {
      const valuesArray = Object.entries(values)
        .filter(([_, value]) => !isNaN(value))
        .map(([testId, value]) => ({
          testId,
          value,
        }));

      if (valuesArray.length === 0) {
        setError("Please enter at least one test value");
        setSubmitting(false);
        return;
      }

      await apiJson(`/v1/labs/patients/${patientId}/results`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId,
          panelId: selectedPanel.id,
          testDate: new Date(testDate).toISOString(),
          externalLab: externalLab || undefined,
          notes: notes || undefined,
          values: valuesArray,
        }),
      });

      toast.success("Lab result added successfully");
      onCreated();
      handleClose();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      setError(e instanceof Error ? e.message : "Failed to save lab result");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedPanel(null);
    setValues({});
    setNotes("");
    setExternalLab("");
    setError(null);
    onClose();
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 2 }}>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <TextField
                  select
                  fullWidth
                  label="Lab Panel"
                  value={selectedPanel?.id || ""}
                  onChange={(e) => {
                    const panel = panels.find((p) => p.id === e.target.value);
                    setSelectedPanel(panel || null);
                    // Initialize values object
                    if (panel) {
                      const initialValues: Record<string, number> = {};
                      panel.tests.forEach((test) => {
                        initialValues[test.id] = 0;
                      });
                      setValues(initialValues);
                    }
                  }}
                  sx={{ mb: 3 }}
                >
                  {panels.map((panel) => (
                    <MenuItem key={panel.id} value={panel.id}>
                      <Box>
                        <Typography variant="body1">{panel.name}</Typography>
                        <Typography variant="caption" color="text.secondary">
                          {panel.category} • {panel.tests.length} tests
                        </Typography>
                      </Box>
                    </MenuItem>
                  ))}
                </TextField>

                {selectedPanel && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <strong>{selectedPanel.name}</strong> includes {selectedPanel.tests.length} tests:
                    <br />
                    {selectedPanel.tests.map((t) => t.name).join(", ")}
                  </Alert>
                )}

                <TextField
                  fullWidth
                  type="date"
                  label="Test Date"
                  value={testDate}
                  onChange={(e) => setTestDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 2 }}
                />

                <TextField
                  fullWidth
                  label="External Lab (optional)"
                  placeholder="e.g., IDEXX, Antech"
                  value={externalLab}
                  onChange={(e) => setExternalLab(e.target.value)}
                />
              </>
            )}
          </Box>
        );

      case 1:
        if (!selectedPanel) return null;
        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="subtitle2" gutterBottom>
              Enter test values for {patientName}
            </Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Test</TableCell>
                    <TableCell align="right">Value</TableCell>
                    <TableCell>Unit</TableCell>
                    <TableCell>Reference Range</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedPanel.tests.map((test) => {
                    const { min, max } = getRefRange(test);
                    const value = values[test.id] || 0;
                    const status = value > 0 ? calculateStatus(value, test) : "normal";

                    return (
                      <TableRow key={test.id}>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500}>
                            {test.name}
                          </Typography>
                          {test.abbreviation && (
                            <Typography variant="caption" color="text.secondary">
                              {test.abbreviation}
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell align="right">
                          <TextField
                            type="number"
                            size="small"
                            value={values[test.id] || ""}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value);
                              setValues((prev) => ({ ...prev, [test.id]: isNaN(val) ? 0 : val }));
                            }}
                            inputProps={{ step: "0.01" }}
                            sx={{ width: 100 }}
                          />
                        </TableCell>
                        <TableCell>{test.unit}</TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {min !== null && max !== null
                              ? `${min} - ${max}`
                              : min !== null
                              ? `> ${min}`
                              : max !== null
                              ? `< ${max}`
                              : "—"}
                          </Typography>
                          {value > 0 && status !== "normal" && (
                            <Chip
                              size="small"
                              label={status}
                              color={status === "high" ? "warning" : "info"}
                              sx={{ ml: 1 }}
                            />
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <TextField
              fullWidth
              multiline
              rows={2}
              label="Notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              sx={{ mt: 2 }}
            />
          </Box>
        );

      case 2:
        if (!selectedPanel) return null;
        const enteredValues = Object.entries(values).filter(([_, v]) => v !== 0);
        const abnormalCount = enteredValues.filter(([testId, value]) => {
          const test = selectedPanel.tests.find((t) => t.id === testId);
          if (!test) return false;
          return calculateStatus(value, test) !== "normal";
        }).length;

        return (
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Review Lab Result
            </Typography>

            <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Panel
              </Typography>
              <Typography variant="body1" fontWeight={500}>
                {selectedPanel.name}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Test Date
              </Typography>
              <Typography variant="body1">{new Date(testDate).toLocaleDateString()}</Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Results Entered
              </Typography>
              <Typography variant="body1">
                {enteredValues.length} of {selectedPanel.tests.length} tests
              </Typography>

              {abnormalCount > 0 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  {abnormalCount} value{abnormalCount !== 1 ? "s" : ""} outside reference range
                </Alert>
              )}
            </Paper>

            <Typography variant="body2" color="text.secondary">
              Click "Save" to add this lab result to {patientName}'s record.
            </Typography>
          </Box>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Lab Result</DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {activeStep > 0 && (
          <Button onClick={handleBack}>Back</Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button variant="contained" onClick={handleNext}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Save Lab Result"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
