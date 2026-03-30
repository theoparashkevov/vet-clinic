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
  Chip,
  Button,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  AlertTitle,
  Grid,
  Card,
  CardContent,
  LinearProgress,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import DownloadIcon from "@mui/icons-material/Download";
import WarningIcon from "@mui/icons-material/Warning";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import RemoveIcon from "@mui/icons-material/Remove";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";
import LabResultDetailDialog from "./LabResultDetailDialog";
import LabResultUploadDialog from "./LabResultUploadDialog";

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

interface Props {
  patientId: string;
  patientName: string;
  patientSpecies: string;
}

export default function LabResultsList({ patientId, patientName, patientSpecies }: Props) {
  const toast = useToast();
  const [results, setResults] = useState<LabResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedResult, setSelectedResult] = useState<LabResult | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const loadResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiJson<LabResult[]>(`/v1/labs/patients/${patientId}/results`);
      setResults(res);
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      setError(e instanceof Error ? e.message : "Failed to load lab results");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResults();
  }, [patientId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "error";
      case "abnormal":
        return "warning";
      case "reviewed":
        return "success";
      case "pending":
        return "default";
      default:
        return "info";
    }
  };

  const getValueStatusColor = (status: string) => {
    switch (status) {
      case "critical_low":
      case "critical_high":
        return "#d32f2f"; // Red
      case "low":
      case "high":
        return "#ed6c02"; // Orange
      default:
        return "#2e7d32"; // Green
    }
  };

  const getTrendIcon = (trend: string | null) => {
    if (!trend) return null;
    if (trend === "up") return <TrendingUpIcon fontSize="small" color="error" />;
    if (trend === "down") return <TrendingDownIcon fontSize="small" color="success" />;
    return <RemoveIcon fontSize="small" color="disabled" />;
  };

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }} color="text.secondary">
          Loading lab results...
        </Typography>
      </Box>
    );
  }

  // Pending results alert
  const pendingResults = results.filter(r => r.status === "pending" || r.status === "abnormal" || r.status === "critical");

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h5">Lab Results</Typography>
        <Button
          variant="contained"
          onClick={() => setUploadOpen(true)}
        >
          Add Lab Result
        </Button>
      </Box>

      {/* Pending Results Alert */}
      {pendingResults.length > 0 && (
        <Alert 
          severity="warning" 
          sx={{ mb: 3 }}
          icon={<WarningIcon />}
        >
          <AlertTitle>Results Need Review</AlertTitle>
          {pendingResults.length} lab result{pendingResults.length !== 1 ? "s" : ""} need{pendingResults.length === 1 ? "s" : ""} your attention
          {pendingResults.some(r => r.criticalCount > 0) && " (includes critical values)"}
        </Alert>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Results List */}
      {results.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary" gutterBottom>
            No lab results on file
          </Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => setUploadOpen(true)}
          >
            Add First Lab Result
          </Button>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Panel</TableCell>
                <TableCell>Lab</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="center">Abnormal</TableCell>
                <TableCell align="center">Critical</TableCell>
                <TableCell>Reviewed</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {results.map((result) => (
                <TableRow
                  key={result.id}
                  sx={{
                    backgroundColor:
                      result.status === "critical"
                        ? "rgba(211, 47, 47, 0.08)"
                        : result.status === "abnormal"
                        ? "rgba(237, 108, 2, 0.08)"
                        : "inherit",
                  }}
                >
                  <TableCell>
                    {new Date(result.testDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>
                      {result.panel.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {result.panel.category}
                    </Typography>
                  </TableCell>
                  <TableCell>{result.externalLab || "In-house"}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      label={result.status}
                      color={getStatusColor(result.status) as any}
                    />
                  </TableCell>
                  <TableCell align="center">
                    {result.abnormalCount > 0 ? (
                      <Chip
                        size="small"
                        label={result.abnormalCount}
                        color="warning"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {result.criticalCount > 0 ? (
                      <Chip
                        size="small"
                        label={result.criticalCount}
                        color="error"
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {result.reviewedBy ? (
                      <Typography variant="body2">
                        {result.reviewedBy}
                        <Typography variant="caption" display="block" color="text.secondary">
                          {result.reviewedDate && new Date(result.reviewedDate).toLocaleDateString()}
                        </Typography>
                      </Typography>
                    ) : (
                      <Chip size="small" label="Pending" variant="outlined" />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        onClick={() => {
                          setSelectedResult(result);
                          setDetailOpen(true);
                        }}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                    {result.pdfUrl && (
                      <Tooltip title="Download PDF">
                        <IconButton href={result.pdfUrl} target="_blank">
                          <DownloadIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Detail Dialog */}
      <LabResultDetailDialog
        open={detailOpen}
        result={selectedResult}
        patientName={patientName}
        patientSpecies={patientSpecies}
        onClose={() => {
          setDetailOpen(false);
          setSelectedResult(null);
        }}
        onUpdated={loadResults}
      />

      {/* Upload Dialog */}
      <LabResultUploadDialog
        open={uploadOpen}
        patientId={patientId}
        patientName={patientName}
        patientSpecies={patientSpecies}
        onClose={() => setUploadOpen(false)}
        onCreated={loadResults}
      />
    </Box>
  );
}
