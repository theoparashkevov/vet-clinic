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
  Button,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Alert,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { apiJson } from "../../../lib/api";
import { useToast } from "../../../components/ToastProvider";
import CsvUploadDialog from "../../../components/CsvUploadDialog";
import type { CsvColumn } from "../../../components/CsvUploadDialog";

interface LabTest {
  id: string;
  name: string;
  abbreviation: string | null;
  unit: string;
  refRangeDogMin: number | null;
  refRangeDogMax: number | null;
  refRangeCatMin: number | null;
  refRangeCatMax: number | null;
  criticalLow: number | null;
  criticalHigh: number | null;
  sortOrder: number;
}

interface LabPanel {
  id: string;
  name: string;
  category: string;
  description: string | null;
  species: string | null;
  isCommon: boolean;
  tests: LabTest[];
}

const CATEGORIES = ["Hematology", "Chemistry", "Urinalysis", "Endocrine", "Microbiology", "Other"];

export default function LabPanelsAdminPage() {
  const toast = useToast();
  const [panels, setPanels] = useState<LabPanel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);

  // Dialog states
  const [panelDialogOpen, setPanelDialogOpen] = useState(false);
  const [editingPanel, setEditingPanel] = useState<LabPanel | null>(null);
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null>(null);
  const [selectedPanelId, setSelectedPanelId] = useState<string | null>(null);

  // Form states
  const [panelForm, setPanelForm] = useState({
    name: "",
    category: "Hematology",
    description: "",
    species: "",
    isCommon: true,
  });

  const [testForm, setTestForm] = useState({
    name: "",
    abbreviation: "",
    unit: "",
    refRangeDogMin: "",
    refRangeDogMax: "",
    refRangeCatMin: "",
    refRangeCatMax: "",
    criticalLow: "",
    criticalHigh: "",
    sortOrder: "0",
  });

  // CSV Upload states
  const [csvPanelOpen, setCsvPanelOpen] = useState(false);
  const [csvTestOpen, setCsvTestOpen] = useState(false);

  const panelColumns: CsvColumn[] = [
    { key: "name", label: "Name", required: true, description: "Panel name (e.g., Complete Blood Count)" },
    { key: "category", label: "Category", description: "Hematology, Chemistry, Urinalysis, Endocrine, Microbiology, Other" },
    { key: "description", label: "Description" },
    { key: "species", label: "Species", description: "dog, cat, or leave blank for both" },
    { key: "isCommon", label: "Common", type: "boolean", description: "true/false" },
  ];

  const testColumns: CsvColumn[] = [
    { key: "panelName", label: "Panel Name", required: true, description: "Must match an existing panel name" },
    { key: "name", label: "Test Name", required: true },
    { key: "abbreviation", label: "Abbreviation" },
    { key: "unit", label: "Unit", description: "e.g., mg/dL, K/µL" },
    { key: "refRangeDogMin", label: "Dog Min", type: "number" },
    { key: "refRangeDogMax", label: "Dog Max", type: "number" },
    { key: "refRangeCatMin", label: "Cat Min", type: "number" },
    { key: "refRangeCatMax", label: "Cat Max", type: "number" },
    { key: "criticalLow", label: "Critical Low", type: "number" },
    { key: "criticalHigh", label: "Critical High", type: "number" },
    { key: "sortOrder", label: "Sort Order", type: "number", description: "Display order within panel" },
  ];

  const handleUploadPanels = async (data: Record<string, any>[]) => {
    const res = await apiJson("/v1/import/lab-panels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    loadPanels();
    return res as { success: number; errors: number; messages: string[] };
  };

  const handleUploadTests = async (data: Record<string, any>[]) => {
    const res = await apiJson("/v1/import/lab-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data }),
    });
    loadPanels();
    return res as { success: number; errors: number; messages: string[] };
  };

  useEffect(() => {
    loadPanels();
  }, []);

  const loadPanels = async () => {
    setLoading(true);
    try {
      const res = await apiJson<LabPanel[]>("/v1/labs/panels");
      setPanels(res);
    } catch (e: any) {
      setError(e.message || "Failed to load lab panels");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePanel = async () => {
    try {
      if (editingPanel) {
        // Update existing panel
        await apiJson(`/v1/labs/panels/${editingPanel.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(panelForm),
        });
        toast.success("Lab panel updated");
      } else {
        // Create new panel
        await apiJson("/v1/labs/panels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(panelForm),
        });
        toast.success("Lab panel created");
      }
      setPanelDialogOpen(false);
      setEditingPanel(null);
      setPanelForm({ name: "", category: "Hematology", description: "", species: "", isCommon: true });
      loadPanels();
    } catch (e: any) {
      toast.error(e.message || "Failed to save panel");
    }
  };

  const handleDeletePanel = async (id: string) => {
    if (!confirm("Are you sure? This will delete all tests in this panel.")) return;
    try {
      await apiJson(`/v1/labs/panels/${id}`, { method: "DELETE" });
      toast.success("Lab panel deleted");
      loadPanels();
    } catch (e: any) {
      toast.error(e.message || "Failed to delete panel");
    }
  };

  const handleSaveTest = async () => {
    if (!selectedPanelId) return;
    try {
      const body = {
        panelId: selectedPanelId,
        name: testForm.name,
        abbreviation: testForm.abbreviation,
        unit: testForm.unit,
        refRangeDogMin: testForm.refRangeDogMin ? parseFloat(testForm.refRangeDogMin) : null,
        refRangeDogMax: testForm.refRangeDogMax ? parseFloat(testForm.refRangeDogMax) : null,
        refRangeCatMin: testForm.refRangeCatMin ? parseFloat(testForm.refRangeCatMin) : null,
        refRangeCatMax: testForm.refRangeCatMax ? parseFloat(testForm.refRangeCatMax) : null,
        criticalLow: testForm.criticalLow ? parseFloat(testForm.criticalLow) : null,
        criticalHigh: testForm.criticalHigh ? parseFloat(testForm.criticalHigh) : null,
        sortOrder: parseInt(testForm.sortOrder) || 0,
      };

      if (editingTest) {
        await apiJson(`/v1/labs/tests/${editingTest.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Lab test updated");
      } else {
        await apiJson("/v1/labs/tests", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        toast.success("Lab test created");
      }
      setTestDialogOpen(false);
      setEditingTest(null);
      setTestForm({
        name: "",
        abbreviation: "",
        unit: "",
        refRangeDogMin: "",
        refRangeDogMax: "",
        refRangeCatMin: "",
        refRangeCatMax: "",
        criticalLow: "",
        criticalHigh: "",
        sortOrder: "0",
      });
      loadPanels();
    } catch (e: any) {
      toast.error(e.message || "Failed to save test");
    }
  };

  const openPanelDialog = (panel?: LabPanel) => {
    if (panel) {
      setEditingPanel(panel);
      setPanelForm({
        name: panel.name,
        category: panel.category,
        description: panel.description || "",
        species: panel.species || "",
        isCommon: panel.isCommon,
      });
    } else {
      setEditingPanel(null);
      setPanelForm({ name: "", category: "Hematology", description: "", species: "", isCommon: true });
    }
    setPanelDialogOpen(true);
  };

  const openTestDialog = (panelId: string, test?: LabTest) => {
    setSelectedPanelId(panelId);
    if (test) {
      setEditingTest(test);
      setTestForm({
        name: test.name,
        abbreviation: test.abbreviation || "",
        unit: test.unit,
        refRangeDogMin: test.refRangeDogMin?.toString() || "",
        refRangeDogMax: test.refRangeDogMax?.toString() || "",
        refRangeCatMin: test.refRangeCatMin?.toString() || "",
        refRangeCatMax: test.refRangeCatMax?.toString() || "",
        criticalLow: test.criticalLow?.toString() || "",
        criticalHigh: test.criticalHigh?.toString() || "",
        sortOrder: test.sortOrder.toString(),
      });
    } else {
      setEditingTest(null);
      setTestForm({
        name: "",
        abbreviation: "",
        unit: "",
        refRangeDogMin: "",
        refRangeDogMax: "",
        refRangeCatMin: "",
        refRangeCatMax: "",
        criticalLow: "",
        criticalHigh: "",
        sortOrder: "0",
      });
    }
    setTestDialogOpen(true);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Lab Panels Management
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Configure lab test panels and reference ranges. These will be available when doctors add lab results to patients.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>Tip:</strong> Set reference ranges for both dogs and cats. Critical values will trigger alerts when results are entered.
        </Typography>
      </Alert>

      {/* Add Panel & CSV Upload Buttons */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => openPanelDialog()}
        >
          Add New Lab Panel
        </Button>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={() => setCsvPanelOpen(true)}
        >
          Import Panels (CSV)
        </Button>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={() => setCsvTestOpen(true)}
        >
          Import Tests (CSV)
        </Button>
      </Box>

      {/* Panels List */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : panels.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <Typography color="text.secondary">
            No lab panels configured yet. Click "Add New Lab Panel" to get started.
          </Typography>
        </Paper>
      ) : (
        <Box>
          {panels.map((panel) => (
            <Accordion key={panel.id} defaultExpanded={panel.isCommon}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, width: "100%" }}>
                  <Typography variant="h6" sx={{ flex: 1 }}>
                    {panel.name}
                  </Typography>
                  <Chip label={panel.category} size="small" color="primary" />
                  {panel.isCommon && <Chip label="Common" size="small" color="success" />}
                  <Chip label={`${panel.tests.length} tests`} size="small" variant="outlined" />
                  <IconButton
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      openPanelDialog(panel);
                    }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeletePanel(panel.id);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {panel.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {panel.description}
                  </Typography>
                )}

                {/* Tests Table */}
                <TableContainer component={Paper} variant="outlined">
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ backgroundColor: "action.hover" }}>
                        <TableCell>Test Name</TableCell>
                        <TableCell>Abbreviation</TableCell>
                        <TableCell>Unit</TableCell>
                        <TableCell>Dog Range</TableCell>
                        <TableCell>Cat Range</TableCell>
                        <TableCell>Critical</TableCell>
                        <TableCell align="right">Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {panel.tests.sort((a, b) => a.sortOrder - b.sortOrder).map((test) => (
                        <TableRow key={test.id}>
                          <TableCell>
                            <Typography variant="body2" fontWeight={500}>
                              {test.name}
                            </Typography>
                          </TableCell>
                          <TableCell>{test.abbreviation || "—"}</TableCell>
                          <TableCell>{test.unit}</TableCell>
                          <TableCell>
                            {test.refRangeDogMin !== null && test.refRangeDogMax !== null
                              ? `${test.refRangeDogMin} - ${test.refRangeDogMax}`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {test.refRangeCatMin !== null && test.refRangeCatMax !== null
                              ? `${test.refRangeCatMin} - ${test.refRangeCatMax}`
                              : "—"}
                          </TableCell>
                          <TableCell>
                            {test.criticalLow !== null && (
                              <Chip size="small" label={`Low: ${test.criticalLow}`} color="error" />
                            )}
                            {test.criticalHigh !== null && (
                              <Chip size="small" label={`High: ${test.criticalHigh}`} color="error" sx={{ ml: 0.5 }} />
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              onClick={() => openTestDialog(panel.id, test)}
                            >
                              <EditIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>

                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => openTestDialog(panel.id)}
                  sx={{ mt: 2 }}
                >
                  Add Test to Panel
                </Button>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      )}

      {/* Panel Dialog */}
      <Dialog open={panelDialogOpen} onClose={() => setPanelDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingPanel ? "Edit Lab Panel" : "Create Lab Panel"}</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Panel Name"
            value={panelForm.name}
            onChange={(e) => setPanelForm({ ...panelForm, name: e.target.value })}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            select
            fullWidth
            label="Category"
            value={panelForm.category}
            onChange={(e) => setPanelForm({ ...panelForm, category: e.target.value })}
            sx={{ mb: 2 }}
          >
            {CATEGORIES.map((cat) => (
              <MenuItem key={cat} value={cat}>
                {cat}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            fullWidth
            label="Description"
            multiline
            rows={2}
            value={panelForm.description}
            onChange={(e) => setPanelForm({ ...panelForm, description: e.target.value })}
            sx={{ mb: 2 }}
          />
          <TextField
            select
            fullWidth
            label="Species (optional)"
            value={panelForm.species}
            onChange={(e) => setPanelForm({ ...panelForm, species: e.target.value })}
            sx={{ mb: 2 }}
          >
            <MenuItem value="">All Species</MenuItem>
            <MenuItem value="Dog">Dog Only</MenuItem>
            <MenuItem value="Cat">Cat Only</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPanelDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSavePanel} disabled={!panelForm.name}>
            {editingPanel ? "Update" : "Create"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Test Dialog */}
      <Dialog open={testDialogOpen} onClose={() => setTestDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTest ? "Edit Lab Test" : "Add Lab Test"}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Test Name"
                value={testForm.name}
                onChange={(e) => setTestForm({ ...testForm, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Abbreviation"
                value={testForm.abbreviation}
                onChange={(e) => setTestForm({ ...testForm, abbreviation: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                label="Unit"
                value={testForm.unit}
                onChange={(e) => setTestForm({ ...testForm, unit: e.target.value })}
                placeholder="e.g., mg/dL"
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Reference Ranges
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dog Min"
                type="number"
                value={testForm.refRangeDogMin}
                onChange={(e) => setTestForm({ ...testForm, refRangeDogMin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Dog Max"
                type="number"
                value={testForm.refRangeDogMax}
                onChange={(e) => setTestForm({ ...testForm, refRangeDogMax: e.target.value })}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cat Min"
                type="number"
                value={testForm.refRangeCatMin}
                onChange={(e) => setTestForm({ ...testForm, refRangeCatMin: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Cat Max"
                type="number"
                value={testForm.refRangeCatMax}
                onChange={(e) => setTestForm({ ...testForm, refRangeCatMax: e.target.value })}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                Critical Values (optional)
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Critical Low"
                type="number"
                value={testForm.criticalLow}
                onChange={(e) => setTestForm({ ...testForm, criticalLow: e.target.value })}
                helperText="Below this = critical alert"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Critical High"
                type="number"
                value={testForm.criticalHigh}
                onChange={(e) => setTestForm({ ...testForm, criticalHigh: e.target.value })}
                helperText="Above this = critical alert"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTestDialogOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSaveTest} disabled={!testForm.name || !testForm.unit}>
            {editingTest ? "Update" : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* CSV Upload Dialogs */}
      <CsvUploadDialog
        open={csvPanelOpen}
        onClose={() => setCsvPanelOpen(false)}
        title="Import Lab Panels"
        description="Upload a CSV file with lab panel definitions. The panel will be created if it doesn't exist, or updated if it does."
        columns={panelColumns}
        onUpload={handleUploadPanels}
        onSuccess={loadPanels}
        templateFileName="lab-panels-template.csv"
      />
      <CsvUploadDialog
        open={csvTestOpen}
        onClose={() => setCsvTestOpen(false)}
        title="Import Lab Tests"
        description="Upload a CSV file with lab tests. Each test must reference an existing panel by name. Tests will be matched by panel + test name."
        columns={testColumns}
        onUpload={handleUploadTests}
        onSuccess={loadPanels}
        templateFileName="lab-tests-template.csv"
      />
    </Box>
  );
}