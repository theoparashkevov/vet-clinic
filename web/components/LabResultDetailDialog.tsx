"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Chip,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  TextField,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import DownloadIcon from "@mui/icons-material/Download";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

interface LabResultValue {
  id: string;
  test: {
    id: string;
    name: string;
    abbreviation: string | null;
    unit: string;
  };
  value: number;
  displayValue: string;
  status: string;
  refRangeMin: number | null;
  refRangeMax: number | null;
  previousValue: number | null;
  trend: string | null;
  notes: string | null;
}

interface LabResult {
  id: string;
  panel: {
    id: string;
    name: string;
    category: string;
  };
  testDate: string;
  receivedDate: string | null;
  reviewedDate: string | null;
  reviewedBy: string | null;
  status: string;
  abnormalCount: number;
  criticalCount: number;
  values: LabResultValue[];
  notes: string | null;
  interpretation: string | null;
  externalLab: string | null;
  pdfUrl: string | null;
}

interface LabResult {
  id: string;
  panel: {
    id: string;
    name: string;
    category: string;
  };
  testDate: string;
  receivedDate: string | null;
  reviewedDate: string | null;
  reviewedBy: string | null;
  status: string;
  abnormalCount: number;
  criticalCount: number;
  values: LabResultValue[];
  notes: string | null;
  interpretation: string | null;
  externalLab: string | null;
  pdfUrl: string | null;
}

interface Props {
  open: boolean;
  result: LabResult | null;
  patientName: string;
  patientSpecies: string;
  onClose: () => void;
  onUpdated: () => void;
}

export default function LabResultDetailDialog({
  open,
  result,
  patientName,
  patientSpecies,
  onClose,
  onUpdated,
}: Props) {
  const toast = useToast();
  const [reviewing, setReviewing] = useState(false);
  const [interpretation, setInterpretation] = useState(result?.interpretation || "");

  if (!result) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical_low":
      case "critical_high":
        return "error";
      case "low":
      case "high":
        return "warning";
      default:
        return "success";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "critical_low":
        return "Critical Low";
      case "critical_high":
        return "Critical High";
      case "low":
        return "Low";
      case "high":
        return "High";
      default:
        return "Normal";
    }
  };

  const getTrendIcon = (trend: string | null) => {
    if (!trend || trend === "stable") return null;
    if (trend === "up") return <TrendingUpIcon fontSize="small" color="error" />;
    return <TrendingDownIcon fontSize="small" color="success" />;
  };

  const handleMarkReviewed = async () => {
    setReviewing(true);
    try {
      await apiJson(`/v1/labs/results/${result.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "reviewed",
          reviewedDate: new Date().toISOString(),
          interpretation: interpretation || undefined,
        }),
      });
      toast.success("Lab result marked as reviewed");
      onUpdated();
      onClose();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      toast.error(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setReviewing(false);
    }
  };

  const formatRefRange = (min: number | null, max: number | null) => {
    if (min !== null && max !== null) return `${min} - ${max}`;
    if (min !== null) return `> ${min}`;
    if (max !== null) return `< ${max}`;
    return "—";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Box>
            <Typography variant="h6">{result.panel.name}</Typography>
            <Typography variant="caption" color="text.secondary">
              {patientName} • {new Date(result.testDate).toLocaleDateString()}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            {result.pdfUrl && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<DownloadIcon />}
                href={result.pdfUrl}
                target="_blank"
              >
                PDF
              </Button>
            )}
            <IconButton onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {/* Status Alerts */}
        {result.criticalCount > 0 && (
          <Alert severity="error" sx={{ mb: 2 }}>
            <strong>Critical Values:</strong> {result.criticalCount} test result{result.criticalCount !== 1 ? "s" : ""} require immediate attention
          </Alert>
        )}
        {result.abnormalCount > 0 && result.criticalCount === 0 && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>Abnormal Values:</strong> {result.abnormalCount} test result{result.abnormalCount !== 1 ? "s" : ""} outside reference range
          </Alert>
        )}

        {/* Lab Info */}
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Test Information
              </Typography>
              <Box sx={{ display: "grid", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Panel:</Typography>
                  <Typography variant="body2">{result.panel.name}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Category:</Typography>
                  <Typography variant="body2">{result.panel.category}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Lab:</Typography>
                  <Typography variant="body2">{result.externalLab || "In-house"}</Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Test Date:</Typography>
                  <Typography variant="body2">{new Date(result.testDate).toLocaleDateString()}</Typography>
                </Box>
                {result.receivedDate && (
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" color="text.secondary">Received:</Typography>
                    <Typography variant="body2">{new Date(result.receivedDate).toLocaleDateString()}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Review Status
              </Typography>
              <Box sx={{ display: "grid", gap: 1 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <Typography variant="body2" color="text.secondary">Status:</Typography>
                  <Chip
                    size="small"
                    label={result.status}
                    color={result.status === "critical" ? "error" : result.status === "abnormal" ? "warning" : result.status === "reviewed" ? "success" : "default"}
                  />
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Abnormal:</Typography>
                  <Typography variant="body2" color={result.abnormalCount > 0 ? "warning.main" : "success.main"}>
                    {result.abnormalCount}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="body2" color="text.secondary">Critical:</Typography>
                  <Typography variant="body2" color={result.criticalCount > 0 ? "error" : "success.main"}>
                    {result.criticalCount}
                  </Typography>
                </Box>
                {result.reviewedBy && (
                  <>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">Reviewed By:</Typography>
                      <Typography variant="body2">{result.reviewedBy}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                      <Typography variant="body2" color="text.secondary">Reviewed On:</Typography>
                      <Typography variant="body2">{result.reviewedDate && new Date(result.reviewedDate).toLocaleDateString()}</Typography>
                    </Box>
                  </>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>

        {/* Results Table */}
        <Typography variant="h6" gutterBottom>
          Test Results
        </Typography>
        <TableContainer component={Paper} variant="outlined" sx={{ mb: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: "action.hover" }}>
                <TableCell>Test</TableCell>
                <TableCell align="right">Result</TableCell>
                <TableCell>Unit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Reference Range</TableCell>
                <TableCell>Trend</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {result.values.map((value) => (
                <TableRow
                  key={value.id}
                  sx={{
                    backgroundColor:
                      value.status === "critical_low" || value.status === "critical_high"
                        ? "rgba(211, 47, 47, 0.08)"
                        : value.status === "low" || value.status === "high"
                        ? "rgba(237, 108, 2, 0.08)"
                        : "inherit",
                  }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {value.test.name}
                    </Typography>
                    {value.test.abbreviation && (
                      <Typography variant="caption" color="text.secondary">
                        {value.test.abbreviation}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Typography
                      variant="body2"
                      fontWeight={700}
                      color={getStatusColor(value.status) + ".main"}
                    >
                      {value.displayValue}
                    </Typography>
                  </TableCell>
                  <TableCell>{value.test.unit}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={getStatusLabel(value.status)}
                      color={getStatusColor(value.status) as any}
                      variant={value.status === "normal" ? "outlined" : "filled"}
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {formatRefRange(value.refRangeMin, value.refRangeMax)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {getTrendIcon(value.trend)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Interpretation */}
        {result.interpretation && (
          <>
            <Typography variant="h6" gutterBottom>
              Veterinarian Interpretation
            </Typography>
            <Paper variant="outlined" sx={{ p: 2, mb: 3, backgroundColor: "primary.light" }}>
              <Typography variant="body1">{result.interpretation}</Typography>
            </Paper>
          </>
        )}

        {/* Add Interpretation (if not reviewed) */}
        {result.status !== "reviewed" && (
          <>
            <Typography variant="h6" gutterBottom>
              Add Interpretation
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Enter your interpretation of these results..."
              value={interpretation}
              onChange={(e) => setInterpretation(e.target.value)}
              sx={{ mb: 2 }}
            />
          </>
        )}

        {/* Notes */}
        {result.notes && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Notes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {result.notes}
            </Typography>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {result.status !== "reviewed" && (
          <Button
            variant="contained"
            onClick={handleMarkReviewed}
            disabled={reviewing}
          >
            {reviewing ? "Saving..." : "Mark as Reviewed"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
