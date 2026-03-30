"use client";

import { useState, useCallback } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
  IconButton,
  Tooltip,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DownloadIcon from "@mui/icons-material/Download";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { useToast } from "./ToastProvider";

export interface CsvColumn {
  key: string;
  label: string;
  required?: boolean;
  type?: "string" | "number" | "boolean";
  description?: string;
}

interface CsvUploadDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description: string;
  columns: CsvColumn[];
  onUpload: (data: Record<string, any>[]) => Promise<{ success: number; errors: number; messages: string[] }>;
  onSuccess: () => void;
  templateFileName?: string;
}

export default function CsvUploadDialog({
  open,
  onClose,
  title,
  description,
  columns,
  onUpload,
  onSuccess,
  templateFileName,
}: CsvUploadDialogProps) {
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<Record<string, any>[]>([]);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ success: number; errors: number; messages: string[] } | null>(null);

  const steps = ["Select File", "Preview Data", "Upload"];

  const requiredColumns = columns.filter((c) => c.required).map((c) => c.key);

  const parseCSV = (text: string): Record<string, any>[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    // Parse header
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));

    // Parse rows
    const result: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          values.push(current.trim().replace(/^["']|["']$/g, ""));
          current = "";
        } else {
          current += char;
        }
      }
      values.push(current.trim().replace(/^["']|["']$/g, ""));

      const row: Record<string, any> = {};
      headers.forEach((header, index) => {
        let rawValue = values[index] || "";
        let parsedValue: any = rawValue;
        // Find column type
        const column = columns.find((c) => c.key === header);
        if (column?.type === "number") {
          parsedValue = rawValue ? parseFloat(rawValue) : null;
        } else if (column?.type === "boolean") {
          parsedValue = rawValue.toLowerCase() === "true" || rawValue === "1" || rawValue.toLowerCase() === "yes";
        }
        row[header] = parsedValue;
      });
      result.push(row);
    }

    return result;
  };

  const validateData = (data: Record<string, any>[]): string[] => {
    const errors: string[] = [];

    data.forEach((row, index) => {
      const rowNum = index + 2; // +2 because row 1 is header

      // Check required columns
      requiredColumns.forEach((col) => {
        const value = row[col];
        if (value === "" || value === null || value === undefined || (typeof value === "string" && value.trim() === "")) {
          errors.push(`Row ${rowNum}: Missing required field "${col}"`);
        }
      });

      // Type validation
      columns.forEach((col) => {
        if (col.type === "number") {
          const value = row[col.key];
          if (value !== null && value !== "" && typeof value === "number" && isNaN(value)) {
            errors.push(`Row ${rowNum}: "${col.key}" must be a number`);
          }
        }
      });
    });

    return errors;
  };

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = event.target.files?.[0];
      if (!selectedFile) return;

      if (!selectedFile.name.endsWith(".csv")) {
        toast.error("Please select a CSV file");
        return;
      }

      setFile(selectedFile);

      const text = await selectedFile.text();
      const data = parseCSV(text);

      if (data.length === 0) {
        toast.error("CSV file appears to be empty or invalid");
        return;
      }

      const errors = validateData(data);
      setParsedData(data);
      setValidationErrors(errors);

      if (errors.length === 0) {
        setActiveStep(1); // Move to preview
      }
    },
    [toast, columns, requiredColumns]
  );

  const handleUpload = async () => {
    if (parsedData.length === 0) return;

    setUploading(true);
    try {
      const result = await onUpload(parsedData);
      setUploadResult(result);
      setActiveStep(2);

      if (result.success > 0 && result.errors === 0) {
        toast.success(`Successfully imported ${result.success} records`);
        onSuccess();
      } else if (result.success > 0 && result.errors > 0) {
        toast.error(`Imported ${result.success} with ${result.errors} errors`);
      }
    } catch (error) {
      toast.error("Upload failed: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const headers = columns.map((c) => c.key).join(",");
    const sampleRow = columns
      .map((c) => {
        if (c.type === "number") return "10.5";
        if (c.type === "boolean") return "true";
        return `"${c.label} Sample"`;
      })
      .join(",");

    const csvContent = `${headers}\n${sampleRow}`;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = templateFileName || "template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setActiveStep(0);
    setFile(null);
    setParsedData([]);
    setValidationErrors([]);
    setUploadResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Box>
            <Alert severity="info" sx={{ mb: 2 }}>
              {description}
            </Alert>

            <Paper
              variant="outlined"
              sx={{
                p: 4,
                textAlign: "center",
                borderStyle: "dashed",
                borderWidth: 2,
                cursor: "pointer",
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() => document.getElementById("csv-upload-input")?.click()}
            >
              <CloudUploadIcon sx={{ fontSize: 48, color: "primary.main", mb: 1 }} />
              <Typography variant="h6" gutterBottom>
                Click to upload CSV file
              </Typography>
              <Typography variant="body2" color="text.secondary">
                or drag and drop
              </Typography>
              <input
                type="file"
                id="csv-upload-input"
                accept=".csv"
                style={{ display: "none" }}
                onChange={handleFileSelect}
              />
            </Paper>

            {file && (
              <Box sx={{ mt: 2, p: 2, bgcolor: "grey.50", borderRadius: 1 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between">
                  <Typography variant="body2">
                    <strong>Selected:</strong> {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </Typography>
                  <IconButton size="small" onClick={() => { setFile(null); setParsedData([]); setValidationErrors([]); }}>
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            )}

            {validationErrors.length > 0 && (
              <Alert severity="error" sx={{ mt: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Validation Errors:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {validationErrors.slice(0, 5).map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                  {validationErrors.length > 5 && (
                    <li>... and {validationErrors.length - 5} more errors</li>
                  )}
                </ul>
              </Alert>
            )}

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Required CSV Columns:
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {columns.map((col) => (
                  <Chip
                    key={col.key}
                    label={col.label}
                    color={col.required ? "primary" : "default"}
                    size="small"
                    variant={col.required ? "filled" : "outlined"}
                    title={col.description}
                  />
                ))}
              </Box>
            </Box>

            <Box sx={{ mt: 2 }}>
              <Button startIcon={<DownloadIcon />} onClick={downloadTemplate} variant="outlined" size="small">
                Download Template
              </Button>
            </Box>
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Alert severity="success" sx={{ mb: 2 }}>
              Validation passed! Found {parsedData.length} records to import.
            </Alert>

            <Typography variant="subtitle2" gutterBottom>
              Preview (first 5 rows):
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 300 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    {columns.map((col) => (
                      <TableCell key={col.key}>{col.label}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {parsedData.slice(0, 5).map((row, idx) => (
                    <TableRow key={idx}>
                      {columns.map((col) => (
                        <TableCell key={col.key}>
                          {row[col.key] !== null && row[col.key] !== undefined
                            ? String(row[col.key])
                            : "—"}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            {parsedData.length > 5 && (
              <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block" }}>
                ... and {parsedData.length - 5} more rows
              </Typography>
            )}

            <Box sx={{ mt: 2 }}>
              <Button variant="outlined" onClick={() => setActiveStep(0)} sx={{ mr: 1 }}>
                Back
              </Button>
              <Button variant="contained" onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Confirm Upload"}
              </Button>
              {uploading && <LinearProgress sx={{ mt: 2 }} />}
            </Box>
          </Box>
        )}

        {activeStep === 2 && uploadResult && (
          <Box>
            <Alert
              severity={uploadResult.errors === 0 ? "success" : uploadResult.success > 0 ? "warning" : "error"}
              sx={{ mb: 2 }}
              icon={uploadResult.errors === 0 ? <CheckCircleIcon /> : <ErrorIcon />}
            >
              <Typography variant="subtitle1">
                Upload Complete: {uploadResult.success} succeeded, {uploadResult.errors} failed
              </Typography>
            </Alert>

            {uploadResult.messages.length > 0 && (
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 200, overflow: "auto" }}>
                <Typography variant="subtitle2" gutterBottom>
                  Messages:
                </Typography>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {uploadResult.messages.map((msg, i) => (
                    <li key={i} style={{ color: msg.includes("Error") ? "error" : "inherit" }}>
                      {msg}
                    </li>
                  ))}
                </ul>
              </Paper>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {activeStep === 2 ? (
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        ) : (
          <Button onClick={handleClose}>Cancel</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
