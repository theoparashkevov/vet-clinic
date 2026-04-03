"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Typography,
  Card,
  CardContent,
  Autocomplete,
  Switch,
  FormControlLabel,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Skeleton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import PreviewIcon from "@mui/icons-material/Preview";
import EditIcon from "@mui/icons-material/Edit";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { format, addDays } from "date-fns";
import { apiJson, AuthError } from "../../../../lib/api";
import type {
  Invoice,
  CreateInvoiceDto,
  ServiceType,
  InvoiceItem,
} from "../../../../lib/billing/types";
import { SERVICE_TYPE_LABELS } from "../../../../lib/billing/types";
import LineItemBuilder from "../../../../components/billing/LineItemBuilder";
import InvoiceStatusBadge from "../../../../components/billing/InvoiceStatusBadge";
import PageHeader from "../../../../components/PageHeader";
import ErrorState from "../../../../components/ErrorState";
import { useToast } from "../../../../components/ToastProvider";

interface Patient {
  id: string;
  name: string;
  species: string;
  breed?: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  };
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

const steps = ["Select Patient", "Add Line Items", "Review & Send"];

export default function CreateInvoicePage() {
  const router = useRouter();
  const toast = useToast();

  const [activeStep, setActiveStep] = useState(0);
  const [previewMode, setPreviewMode] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);
  const [patientsLoading, setPatientsLoading] = useState(true);
  const [patientsError, setPatientsError] = useState<string | null>(null);

  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [dueDate, setDueDate] = useState(format(addDays(new Date(), 30), "yyyy-MM-dd"));
  const [notes, setNotes] = useState("");
  const [terms, setTerms] = useState("Payment due within 30 days");
  const [taxRate, setTaxRate] = useState(0.08);
  const [lineItems, setLineItems] = useState<Omit<InvoiceItem, "id" | "invoiceId" | "createdAt">[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatients = async () => {
      setPatientsLoading(true);
      setPatientsError(null);
      try {
        const response = await apiJson<{ data: Patient[] }>("/v1/patients?limit=1000");
        setPatients(response.data);
      } catch (err) {
        if (err instanceof AuthError) return;
        setPatientsError(err instanceof Error ? err.message : "Failed to load patients");
      } finally {
        setPatientsLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const calculateTotals = useCallback(() => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
    const total = Math.round((subtotal + taxAmount) * 100) / 100;
    return { subtotal, taxAmount, total };
  }, [lineItems, taxRate]);

  const { subtotal, taxAmount, total } = calculateTotals();

  const handleNext = () => {
    if (activeStep === 0 && !selectedPatient) {
      toast.error("Please select a patient");
      return;
    }
    if (activeStep === 1 && lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
  };

  const handleSave = async (sendImmediately = false) => {
    if (!selectedPatient) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const invoiceData: CreateInvoiceDto = {
        patientId: selectedPatient.id,
        ownerId: selectedPatient.owner.id,
        dueDate: new Date(dueDate).toISOString(),
        items: lineItems.map((item) => ({
          serviceType: item.serviceType,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
        notes: notes || undefined,
        taxRate,
      };

      const invoice = await apiJson<Invoice>("/v1/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(invoiceData),
      });

      if (sendImmediately) {
        await apiJson(`/v1/invoices/${invoice.id}/send`, {
          method: "POST",
        });
        toast.success("Invoice created and sent successfully");
      } else {
        toast.success("Invoice saved as draft");
      }

      router.push(`/admin/billing/invoices/${invoice.id}`);
    } catch (err) {
      if (err instanceof AuthError) return;
      setSubmitError(err instanceof Error ? err.message : "Failed to create invoice");
      setSubmitting(false);
    }
  };

  const renderPatientStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Select Patient
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Choose the patient for this invoice. The owner information will be automatically populated.
      </Typography>

      {patientsLoading ? (
        <Skeleton variant="rectangular" height={56} />
      ) : patientsError ? (
        <ErrorState
          title="Couldn't load patients"
          message="Please check your connection and try again."
          details={patientsError}
          onRetry={() => window.location.reload()}
        />
      ) : (
        <Autocomplete
          options={patients}
          getOptionLabel={(patient) =>
            `${patient.name} (${patient.species}) - Owner: ${patient.owner.name}`
          }
          value={selectedPatient}
          onChange={(_, value) => setSelectedPatient(value)}
          renderInput={(params) => (
            <TextField
              {...params}
              label="Search and select patient"
              placeholder="Type to search patients..."
              fullWidth
            />
          )}
          renderOption={(props, patient) => (
            <Box component="li" {...props}>
              <Box>
                <Typography variant="body1">{patient.name}</Typography>
                <Typography variant="caption" color="text.secondary">
                  {patient.species}
                  {patient.breed && ` • ${patient.breed}`} - Owner: {patient.owner.name}
                </Typography>
              </Box>
            </Box>
          )}
        />
      )}

      {selectedPatient && (
        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Patient Information
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight={600}>
                  {selectedPatient.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPatient.species}
                  {selectedPatient.breed && ` • ${selectedPatient.breed}`}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body1" fontWeight={600}>
                  {selectedPatient.owner.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedPatient.owner.email}
                </Typography>
                {selectedPatient.owner.phone && (
                  <Typography variant="body2" color="text.secondary">
                    {selectedPatient.owner.phone}
                  </Typography>
                )}
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderLineItemsStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Line Items
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Add services, procedures, medications, and other charges to the invoice.
      </Typography>

      <LineItemBuilder
        items={lineItems}
        onChange={setLineItems}
        taxRate={taxRate}
        onTaxRateChange={setTaxRate}
      />

      <Grid container spacing={3} sx={{ mt: 3 }}>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Terms & Conditions"
            value={terms}
            onChange={(e) => setTerms(e.target.value)}
            multiline
            rows={1}
          />
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            rows={3}
            placeholder="Additional notes for the invoice..."
          />
        </Grid>
      </Grid>
    </Box>
  );

  const renderReviewStep = () => (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6">Review Invoice</Typography>
        <FormControlLabel
          control={
            <Switch
              checked={previewMode}
            onChange={(e) => setPreviewMode(e.target.checked)}
            />
          }
          label={previewMode ? "Preview Mode" : "Edit Mode"}
        />
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {submitError}
        </Alert>
      )}

      {previewMode ? (
        <Card>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 4,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    width: 56,
                    height: 56,
                    borderRadius: 2,
                    backgroundColor: "primary.main",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LocalHospitalIcon sx={{ color: "white", fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight={700}>
                    Vet Clinic
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Professional Veterinary Services
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography variant="h5" fontWeight={700}>
                  INVOICE
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Draft
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Billed To:
                </Typography>
                {selectedPatient && (
                  <>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPatient.owner.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPatient.owner.email}
                    </Typography>
                    {selectedPatient.owner.phone && (
                      <Typography variant="body2" color="text.secondary">
                        {selectedPatient.owner.phone}
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Patient:
                </Typography>
                {selectedPatient && (
                  <>
                    <Typography variant="body1" fontWeight={600}>
                      {selectedPatient.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {selectedPatient.species}
                      {selectedPatient.breed && ` • ${selectedPatient.breed}`}
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>

            <Grid container spacing={4} sx={{ mb: 4 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Issue Date
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {format(new Date(), "MMM d, yyyy")}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="text.secondary">
                  Due Date
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {format(new Date(dueDate), "MMM d, yyyy")}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Typography variant="h6" gutterBottom>
              Line Items
            </Typography>
            <Box sx={{ mb: 3 }}>
              {lineItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 1,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600}>
                      {SERVICE_TYPE_LABELS[item.serviceType]}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {formatCurrency(item.total)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box sx={{ width: 300 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography color="text.secondary">Subtotal:</Typography>
                  <Typography>{formatCurrency(subtotal)}</Typography>
                </Box>
                {taxAmount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">
                      Tax ({(taxRate * 100).toFixed(2)}%):
                    </Typography>
                    <Typography>{formatCurrency(taxAmount)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 1 }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" fontWeight={700}>
                    Total:
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="primary">
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {(notes || terms) && (
              <>
                <Divider sx={{ my: 3 }} />
                <Grid container spacing={3}>
                  {notes && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Notes:
                      </Typography>
                      <Typography variant="body2">{notes}</Typography>
                    </Grid>
                  )}
                  {terms && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Terms & Conditions:
                      </Typography>
                      <Typography variant="body2">{terms}</Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Box>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Patient & Owner
              </Typography>
              {selectedPatient && (
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight={600}>
                      Patient: {selectedPatient.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedPatient.species}
                      {selectedPatient.breed && ` • ${selectedPatient.breed}`}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" fontWeight={600}>
                      Owner: {selectedPatient.owner.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {selectedPatient.owner.email}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </CardContent>
          </Card>

          <LineItemBuilder
            items={lineItems}
            onChange={setLineItems}
            taxRate={taxRate}
            onTaxRateChange={setTaxRate}
            readOnly
          />

          <Grid container spacing={3} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Due Date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                label="Terms & Conditions"
                value={terms}
                onChange={(e) => setTerms(e.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </Box>
  );

  return (
    <Box>
      <PageHeader
        title="Create Invoice"
        subtitle="Create a new invoice for a patient"
        actions={
          <Button
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/admin/billing/invoices"
          >
            Cancel
          </Button>
        }
      />

      <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {activeStep === 0 && renderPatientStep()}
          {activeStep === 1 && renderLineItemsStep()}
          {activeStep === 2 && renderReviewStep()}

          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4, pt: 3, borderTop: "1px solid", borderColor: "divider" }}>
            <Button
              onClick={activeStep === 0 ? () => router.push("/admin/billing/invoices") : handleBack}
              startIcon={activeStep === 0 ? <ArrowBackIcon /> : undefined}
            >
              {activeStep === 0 ? "Cancel" : "Back"}
            </Button>

            <Box sx={{ display: "flex", gap: 2 }}>
              {activeStep === 2 ? (
                <>
                  <Button
                    variant="outlined"
                    startIcon={<SaveIcon />}
                    onClick={() => handleSave(false)}
                    disabled={submitting}
                  >
                    {submitting ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => handleSave(true)}
                    disabled={submitting}
                  >
                    {submitting ? "Sending..." : "Save & Send"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  Next
                </Button>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
