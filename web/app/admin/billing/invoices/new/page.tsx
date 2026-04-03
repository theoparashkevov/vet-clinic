"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  TextField,
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
  Avatar,
  Breadcrumbs,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SaveIcon from "@mui/icons-material/Save";
import SendIcon from "@mui/icons-material/Send";
import PreviewIcon from "@mui/icons-material/Preview";
import EditIcon from "@mui/icons-material/Edit";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import PersonIcon from "@mui/icons-material/Person";
import PetsIcon from "@mui/icons-material/Pets";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { format, addDays } from "date-fns";
import { apiJson, AuthError } from "../../../../../lib/api";
import type {
  Invoice,
  CreateInvoiceDto,
  InvoiceItem,
} from "../../../../../lib/billing/types";
import { SERVICE_TYPE_LABELS } from "../../../../../lib/billing/types";
import LineItemBuilder from "../../../../../components/billing/LineItemBuilder";
import PageHeader from "../../../../../components/PageHeader";
import ErrorState from "../../../../../components/ErrorState";
import { useToast } from "../../../../../components/ToastProvider";

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
      <Typography variant="h6" fontWeight={700} color="#1C1917" gutterBottom>
        Select Patient
      </Typography>
      <Typography variant="body2" color="#78716C" sx={{ mb: 3 }}>
        Choose the patient for this invoice. The owner information will be automatically populated.
      </Typography>

      {patientsLoading ? (
        <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 3 }} />
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
              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: "rgba(196, 112, 90, 0.1)",
                    color: "#C4705A",
                  }}
                >
                  <PetsIcon fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="body1" fontWeight={600} color="#1C1917">
                    {patient.name}
                  </Typography>
                  <Typography variant="caption" color="#78716C">
                    {patient.species}
                    {patient.breed && ` • ${patient.breed}`} - Owner: {patient.owner.name}
                  </Typography>
                </Box>
              </Box>
            </Box>
          )}
        />
      )}

      {selectedPatient && (
        <Card
          variant="outlined"
          sx={{
            mt: 3,
            borderRadius: 4,
            border: "1px solid #E7E5E4",
            backgroundColor: "#FAFAF9",
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle2" color="#57534E" fontWeight={600} gutterBottom>
              Patient Information
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "rgba(196, 112, 90, 0.1)",
                      color: "#C4705A",
                    }}
                  >
                    <PetsIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600} color="#1C1917">
                      {selectedPatient.name}
                    </Typography>
                    <Typography variant="body2" color="#78716C">
                      {selectedPatient.species}
                      {selectedPatient.breed && ` • ${selectedPatient.breed}`}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Avatar
                    sx={{
                      width: 40,
                      height: 40,
                      bgcolor: "rgba(13, 115, 119, 0.1)",
                      color: "#0D7377",
                    }}
                  >
                    <PersonIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="body1" fontWeight={600} color="#1C1917">
                      {selectedPatient.owner.name}
                    </Typography>
                    <Typography variant="body2" color="#78716C">
                      {selectedPatient.owner.email}
                    </Typography>
                    {selectedPatient.owner.phone && (
                      <Typography variant="body2" color="#78716C">
                        {selectedPatient.owner.phone}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}
    </Box>
  );

  const renderLineItemsStep = () => (
    <Box>
      <Typography variant="h6" fontWeight={700} color="#1C1917" gutterBottom>
        Line Items
      </Typography>
      <Typography variant="body2" color="#78716C" sx={{ mb: 3 }}>
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
        <Typography variant="h6" fontWeight={700} color="#1C1917">
          Review Invoice
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={previewMode}
              onChange={(e) => setPreviewMode(e.target.checked)}
              sx={{
                "& .MuiSwitch-switchBase.Mui-checked": {
                  color: "#0D7377",
                },
                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                  backgroundColor: "#0D7377",
                },
              }}
            />
          }
          label={
            <Typography variant="body2" fontWeight={500} color="#57534E">
              {previewMode ? "Preview Mode" : "Edit Mode"}
            </Typography>
          }
        />
      </Box>

      {submitError && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }}>
          {submitError}
        </Alert>
      )}

      {previewMode ? (
        <Card sx={{ borderRadius: 4, border: "1px solid #E7E5E4" }}>
          <CardContent sx={{ p: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                mb: 5,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    borderRadius: 3,
                    background: "linear-gradient(135deg, #0D7377 0%, #14A098 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 8px 24px rgba(13, 115, 119, 0.25)",
                  }}
                >
                  <LocalHospitalIcon sx={{ color: "white", fontSize: 32 }} />
                </Box>
                <Box>
                  <Typography variant="h5" fontWeight={700} color="#1C1917">
                    Vet Clinic
                  </Typography>
                  <Typography variant="body2" color="#78716C">
                    Professional Veterinary Services
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  variant="h4"
                  fontWeight={700}
                  color="#1C1917"
                  letterSpacing="-0.02em"
                >
                  INVOICE
                </Typography>
                <Typography variant="body2" color="#78716C" fontWeight={500}>
                  Draft
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={4} sx={{ mb: 5 }}>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="#57534E" fontWeight={600} gutterBottom>
                  Billed To:
                </Typography>
                {selectedPatient && (
                  <>
                    <Typography variant="body1" fontWeight={600} color="#1C1917">
                      {selectedPatient.owner.name}
                    </Typography>
                    <Typography variant="body2" color="#78716C">
                      {selectedPatient.owner.email}
                    </Typography>
                    {selectedPatient.owner.phone && (
                      <Typography variant="body2" color="#78716C">
                        {selectedPatient.owner.phone}
                      </Typography>
                    )}
                  </>
                )}
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="subtitle2" color="#57534E" fontWeight={600} gutterBottom>
                  Patient:
                </Typography>
                {selectedPatient && (
                  <>
                    <Typography variant="body1" fontWeight={600} color="#1C1917">
                      {selectedPatient.name}
                    </Typography>
                    <Typography variant="body2" color="#78716C">
                      {selectedPatient.species}
                      {selectedPatient.breed && ` • ${selectedPatient.breed}`}
                    </Typography>
                  </>
                )}
              </Grid>
            </Grid>

            <Grid container spacing={4} sx={{ mb: 5 }}>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="#A8A29E" fontWeight={600} display="block" mb={1}>
                  Issue Date
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#1C1917">
                  {format(new Date(), "MMM d, yyyy")}
                </Typography>
              </Grid>
              <Grid item xs={6} sm={3}>
                <Typography variant="caption" color="#A8A29E" fontWeight={600} display="block" mb={1}>
                  Due Date
                </Typography>
                <Typography variant="body2" fontWeight={600} color="#1C1917">
                  {format(new Date(dueDate), "MMM d, yyyy")}
                </Typography>
              </Grid>
            </Grid>

            <Divider sx={{ my: 4, borderColor: "#E7E5E4" }} />

            <Typography variant="h6" fontWeight={700} color="#1C1917" gutterBottom>
              Line Items
            </Typography>
            <Box sx={{ mb: 4 }}>
              {lineItems.map((item, index) => (
                <Box
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    py: 2,
                    borderBottom: "1px solid",
                    borderColor: "#F5F5F4",
                  }}
                >
                  <Box>
                    <Typography variant="body2" fontWeight={600} color="#1C1917">
                      {SERVICE_TYPE_LABELS[item.serviceType]}
                    </Typography>
                    <Typography variant="caption" color="#78716C">
                      {item.description}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: "right" }}>
                    <Typography variant="body2" color="#57534E">
                      {item.quantity} x {formatCurrency(item.unitPrice)}
                    </Typography>
                    <Typography variant="body2" fontWeight={600} color="#1C1917">
                      {formatCurrency(item.total)}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Box sx={{ width: 300 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                  <Typography color="#78716C" fontWeight={500}>Subtotal:</Typography>
                  <Typography fontWeight={500} color="#1C1917">{formatCurrency(subtotal)}</Typography>
                </Box>
                {taxAmount > 0 && (
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography color="#78716C" fontWeight={500}>
                      Tax ({(taxRate * 100).toFixed(2)}%):
                    </Typography>
                    <Typography fontWeight={500} color="#1C1917">{formatCurrency(taxAmount)}</Typography>
                  </Box>
                )}
                <Divider sx={{ my: 2, borderColor: "#E7E5E4" }} />
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography variant="h6" fontWeight={700} color="#1C1917">
                    Total:
                  </Typography>
                  <Typography variant="h6" fontWeight={700} color="#0D7377">
                    {formatCurrency(total)}
                  </Typography>
                </Box>
              </Box>
            </Box>

            {(notes || terms) && (
              <>
                <Divider sx={{ my: 4, borderColor: "#E7E5E4" }} />
                <Grid container spacing={4}>
                  {notes && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="#57534E" fontWeight={600} gutterBottom>
                        Notes:
                      </Typography>
                      <Typography variant="body2" color="#78716C">{notes}</Typography>
                    </Grid>
                  )}
                  {terms && (
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" color="#57534E" fontWeight={600} gutterBottom>
                        Terms & Conditions:
                      </Typography>
                      <Typography variant="body2" color="#78716C">{terms}</Typography>
                    </Grid>
                  )}
                </Grid>
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Box>
          <Card
            variant="outlined"
            sx={{
              mb: 3,
              borderRadius: 4,
              border: "1px solid #E7E5E4",
              backgroundColor: "#FAFAF9",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="subtitle2" color="#57534E" fontWeight={600} gutterBottom>
                Patient & Owner
              </Typography>
              {selectedPatient && (
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "rgba(196, 112, 90, 0.1)",
                          color: "#C4705A",
                        }}
                      >
                        <PetsIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="#1C1917">
                          Patient: {selectedPatient.name}
                        </Typography>
                        <Typography variant="caption" color="#78716C">
                          {selectedPatient.species}
                          {selectedPatient.breed && ` • ${selectedPatient.breed}`}
                        </Typography>
                      </Box>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        sx={{
                          width: 36,
                          height: 36,
                          bgcolor: "rgba(13, 115, 119, 0.1)",
                          color: "#0D7377",
                        }}
                      >
                        <PersonIcon fontSize="small" />
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={600} color="#1C1917">
                          Owner: {selectedPatient.owner.name}
                        </Typography>
                        <Typography variant="caption" color="#78716C">
                          {selectedPatient.owner.email}
                        </Typography>
                      </Box>
                    </Box>
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
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" sx={{ color: "#A8A29E" }} />}
        aria-label="breadcrumb"
        sx={{ mb: 2 }}
      >
        <Link
          href="/admin/billing/dashboard"
          style={{
            color: "#78716C",
            textDecoration: "none",
            fontSize: "0.8125rem",
            fontWeight: 500,
          }}
        >
          Billing
        </Link>
        <Link
          href="/admin/billing/invoices"
          style={{
            color: "#78716C",
            textDecoration: "none",
            fontSize: "0.8125rem",
            fontWeight: 500,
          }}
        >
          Invoices
        </Link>
        <Typography color="#1C1917" fontSize="0.8125rem" fontWeight={600}>
          Create Invoice
        </Typography>
      </Breadcrumbs>

      <PageHeader
        title="Create Invoice"
        subtitle="Create a new invoice for a patient"
        showBreadcrumbs={false}
        actions={
          <Button
            startIcon={<ArrowBackIcon />}
            component={Link}
            href="/admin/billing/invoices"
            sx={{
              color: "#57534E",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "rgba(13, 115, 119, 0.08)",
                color: "#0D7377",
              },
            }}
          >
            Cancel
          </Button>
        }
      />

      <Stepper
        activeStep={activeStep}
        sx={{
          mb: 4,
          "& .MuiStepLabel-label": {
            fontWeight: 500,
            color: "#78716C",
            "&.Mui-active": {
              fontWeight: 600,
              color: "#0D7377",
            },
            "&.Mui-completed": {
              fontWeight: 600,
              color: "#059669",
            },
          },
        }}
      >
        {steps.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Card sx={{ borderRadius: 4, border: "1px solid #E7E5E4" }}>
        <CardContent sx={{ p: 4 }}>
          {activeStep === 0 && renderPatientStep()}
          {activeStep === 1 && renderLineItemsStep()}
          {activeStep === 2 && renderReviewStep()}

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mt: 4,
              pt: 3,
              borderTop: "1px solid",
              borderColor: "#E7E5E4",
            }}
          >
            <Button
              onClick={activeStep === 0 ? () => router.push("/admin/billing/invoices") : handleBack}
              startIcon={activeStep === 0 ? <ArrowBackIcon /> : undefined}
              sx={{
                color: "#57534E",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "rgba(13, 115, 119, 0.08)",
                  color: "#0D7377",
                },
              }}
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
                    sx={{
                      borderColor: "#E7E5E4",
                      color: "#57534E",
                      fontWeight: 600,
                      "&:hover": {
                        borderColor: "#D6D3D1",
                        backgroundColor: "#FAFAF9",
                      },
                    }}
                  >
                    {submitting ? "Saving..." : "Save as Draft"}
                  </Button>
                  <Button
                    variant="contained"
                    startIcon={<SendIcon />}
                    onClick={() => handleSave(true)}
                    disabled={submitting}
                    sx={{
                      backgroundColor: "#0D7377",
                      fontWeight: 600,
                      "&:hover": {
                        backgroundColor: "#0A5A5D",
                      },
                    }}
                  >
                    {submitting ? "Sending..." : "Save & Send"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  sx={{
                    backgroundColor: "#0D7377",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "#0A5A5D",
                    },
                  }}
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
