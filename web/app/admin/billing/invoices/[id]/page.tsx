"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  Grid,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Breadcrumbs,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import PaymentIcon from "@mui/icons-material/Payment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BlockIcon from "@mui/icons-material/Block";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PersonIcon from "@mui/icons-material/Person";
import PetsIcon from "@mui/icons-material/Pets";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import { format } from "date-fns";
import { apiJson, AuthError } from "../../../../../lib/api";
import type { Invoice, Payment } from "../../../../../lib/billing/types";
import { PAYMENT_METHOD_LABELS, SERVICE_TYPE_LABELS } from "../../../../../lib/billing/types";
import InvoiceStatusBadge from "../../../../../components/billing/InvoiceStatusBadge";
import RecordPaymentModal from "../../../../../components/billing/RecordPaymentModal";
import { useToast } from "../../../../../components/ToastProvider";

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const toast = useToast();
  const invoiceId = params.id as string;

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [voidDialogOpen, setVoidDialogOpen] = useState(false);
  const [processingAction, setProcessingAction] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await apiJson<Invoice>(`/v1/invoices/${invoiceId}`);
        setInvoice(response);
      } catch (err) {
        if (err instanceof AuthError) return;
        setError(err instanceof Error ? err.message : "Failed to load invoice");
      } finally {
        setLoading(false);
      }
    };

    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]);

  const handleSendInvoice = async () => {
    if (!invoice) return;
    setProcessingAction(true);
    try {
      await apiJson(`/v1/invoices/${invoice.id}/send`, {
        method: "POST",
      });
      toast.success(`Invoice ${invoice.invoiceNumber} sent successfully`);
      const updated = await apiJson<Invoice>(`/v1/invoices/${invoiceId}`);
      setInvoice(updated);
    } catch (err) {
      if (err instanceof AuthError) return;
      toast.error(err instanceof Error ? err.message : "Failed to send invoice");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleVoidInvoice = async () => {
    if (!invoice) return;
    setProcessingAction(true);
    try {
      await apiJson(`/v1/invoices/${invoice.id}/void`, {
        method: "POST",
      });
      toast.success(`Invoice ${invoice.invoiceNumber} voided`);
      setVoidDialogOpen(false);
      const updated = await apiJson<Invoice>(`/v1/invoices/${invoiceId}`);
      setInvoice(updated);
    } catch (err) {
      if (err instanceof AuthError) return;
      toast.error(err instanceof Error ? err.message : "Failed to void invoice");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRecordPayment = async (data: {
    amount: number;
    method: string;
    notes?: string;
  }) => {
    if (!invoice) return;
    setProcessingAction(true);
    try {
      await apiJson("/v1/payments/record-offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: invoice.id,
          amount: data.amount,
          method: data.method,
          notes: data.notes,
        }),
      });
      toast.success("Payment recorded successfully");
      setPaymentModalOpen(false);
      const updated = await apiJson<Invoice>(`/v1/invoices/${invoiceId}`);
      setInvoice(updated);
    } catch (err) {
      if (err instanceof AuthError) return;
      toast.error(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setProcessingAction(false);
    }
  };

  const canEdit = invoice?.status === "DRAFT";
  const canSend = invoice?.status === "DRAFT";
  const canRecordPayment =
    invoice?.status === "SENT" ||
    invoice?.status === "PARTIAL" ||
    invoice?.status === "OVERDUE";
  const canVoid =
    invoice?.status !== "PAID" &&
    invoice?.status !== "REFUNDED" &&
    invoice?.status !== "CANCELLED";

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3, borderRadius: 4 }} />
        <Skeleton variant="rectangular" height={600} sx={{ borderRadius: 4 }} />
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin/billing/invoices")}
          sx={{ mb: 2, color: "#57534E" }}
        >
          Back to Invoices
        </Button>
        <Alert severity="error" sx={{ borderRadius: 3 }}>
          {error || "Invoice not found"}
        </Alert>
      </Box>
    );
  }

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
          {invoice.invoiceNumber}
        </Typography>
      </Breadcrumbs>

      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin/billing/invoices")}
          sx={{
            color: "#57534E",
            fontWeight: 600,
            "&:hover": {
              backgroundColor: "rgba(13, 115, 119, 0.08)",
              color: "#0D7377",
            },
          }}
        >
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              color: "#1C1917",
              letterSpacing: "-0.02em",
            }}
          >
            Invoice {invoice.invoiceNumber}
          </Typography>
        </Box>
        <InvoiceStatusBadge status={invoice.status} size="medium" />
      </Box>

      <Box sx={{ display: "flex", gap: 1.5, mb: 4, flexWrap: "wrap" }}>
        {canEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            component={Link}
            href={`/admin/billing/invoices/${invoice.id}/edit`}
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
            Edit
          </Button>
        )}
        {canSend && (
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSendInvoice}
            disabled={processingAction}
            sx={{
              backgroundColor: "#0D7377",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#0A5A5D",
              },
            }}
          >
            Send to Client
          </Button>
        )}
        {canRecordPayment && (
          <Button
            variant="contained"
            startIcon={<PaymentIcon />}
            onClick={() => setPaymentModalOpen(true)}
            disabled={processingAction}
            sx={{
              backgroundColor: "#059669",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#047857",
              },
            }}
          >
            Record Payment
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          disabled
          sx={{
            borderColor: "#E7E5E4",
            color: "#A8A29E",
            fontWeight: 600,
          }}
        >
          Download PDF
        </Button>
        {canVoid && (
          <Button
            variant="outlined"
            color="error"
            startIcon={<BlockIcon />}
            onClick={() => setVoidDialogOpen(true)}
            disabled={processingAction}
            sx={{
              borderColor: "#FCA5A5",
              color: "#DC2626",
              fontWeight: 600,
              "&:hover": {
                borderColor: "#DC2626",
                backgroundColor: "rgba(220, 38, 38, 0.04)",
              },
            }}
          >
            Void
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
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
                    {invoice.invoiceNumber}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={4} sx={{ mb: 5 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "rgba(13, 115, 119, 0.1)",
                        color: "#0D7377",
                      }}
                    >
                      <PersonIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle2" color="#57534E" fontWeight={600}>
                      Billed To
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600} color="#1C1917" sx={{ ml: 5 }}>
                    {invoice.owner.name}
                  </Typography>
                  <Typography variant="body2" color="#78716C" sx={{ ml: 5 }}>
                    {invoice.owner.email}
                  </Typography>
                  {invoice.owner.phone && (
                    <Typography variant="body2" color="#78716C" sx={{ ml: 5 }}>
                      {invoice.owner.phone}
                    </Typography>
                  )}
                  {invoice.owner.address && (
                    <Typography variant="body2" color="#78716C" sx={{ ml: 5 }}>
                      {invoice.owner.address}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 32,
                        height: 32,
                        bgcolor: "rgba(196, 112, 90, 0.1)",
                        color: "#C4705A",
                      }}
                    >
                      <PetsIcon fontSize="small" />
                    </Avatar>
                    <Typography variant="subtitle2" color="#57534E" fontWeight={600}>
                      Patient
                    </Typography>
                  </Box>
                  <Typography variant="body1" fontWeight={600} color="#1C1917" sx={{ ml: 5 }}>
                    {invoice.patient.name}
                  </Typography>
                  <Typography variant="body2" color="#78716C" sx={{ ml: 5 }}>
                    {invoice.patient.species}
                    {invoice.patient.breed && ` • ${invoice.patient.breed}`}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={3} sx={{ mb: 5 }}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: "#A8A29E" }} />
                    <Typography variant="caption" color="#A8A29E" fontWeight={600}>
                      Issue Date
                    </Typography>
                  </Box>
                  <Typography variant="body2" fontWeight={600} color="#1C1917">
                    {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                    <CalendarTodayIcon sx={{ fontSize: 16, color: "#A8A29E" }} />
                    <Typography variant="caption" color="#A8A29E" fontWeight={600}>
                      Due Date
                    </Typography>
                  </Box>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={invoice.status === "OVERDUE" ? "#DC2626" : "#1C1917"}
                  >
                    {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#A8A29E" fontWeight={600} display="block" mb={1}>
                    Created By
                  </Typography>
                  <Typography variant="body2" fontWeight={600} color="#1C1917">
                    {invoice.createdBy.name}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="#A8A29E" fontWeight={600} display="block" mb={1}>
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <InvoiceStatusBadge status={invoice.status} size="small" />
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 4, borderColor: "#E7E5E4" }} />

              <Typography variant="h6" fontWeight={700} color="#1C1917" gutterBottom>
                Line Items
              </Typography>
              <TableContainer
                component={Paper}
                variant="outlined"
                sx={{
                  borderRadius: 3,
                  border: "1px solid #E7E5E4",
                  mb: 4,
                }}
              >
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#FAFAF9" }}>
                      <TableCell sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                        Service
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                        Description
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                        Qty
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                        Unit Price
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                        Total
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item: Invoice["items"][0]) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Typography variant="body2" fontWeight={500} color="#1C1917">
                            {SERVICE_TYPE_LABELS[item.serviceType]}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="#57534E">
                            {item.description}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="#1C1917">
                            {item.quantity}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" color="#1C1917">
                            {formatCurrency(item.unitPrice)}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Typography variant="body2" fontWeight={600} color="#1C1917">
                            {formatCurrency(item.total)}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Box sx={{ width: 320 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography color="#78716C" fontWeight={500}>Subtotal:</Typography>
                    <Typography fontWeight={500} color="#1C1917">{formatCurrency(invoice.subtotal)}</Typography>
                  </Box>
                  {invoice.taxAmount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                      <Typography color="#78716C" fontWeight={500}>
                        Tax ({(invoice.taxRate * 100).toFixed(2)}%):
                      </Typography>
                      <Typography fontWeight={500} color="#1C1917">{formatCurrency(invoice.taxAmount)}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 2, borderColor: "#E7E5E4" }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography fontWeight={700} color="#1C1917">Total:</Typography>
                    <Typography fontWeight={700} color="#1C1917">
                      {formatCurrency(invoice.total)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1.5 }}>
                    <Typography color="#78716C" fontWeight={500}>Amount Paid:</Typography>
                    <Typography color="#059669" fontWeight={600}>
                      {formatCurrency(invoice.amountPaid)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      pt: 2,
                      borderTop: "2px solid",
                      borderColor: "#E7E5E4",
                    }}
                  >
                    <Typography fontWeight={700} color="#1C1917" variant="h6">Balance Due:</Typography>
                    <Typography
                      fontWeight={700}
                      variant="h6"
                      color={invoice.balanceDue > 0 ? "#DC2626" : "#059669"}
                    >
                      {formatCurrency(invoice.balanceDue)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {(invoice.notes || invoice.terms) && (
                <>
                  <Divider sx={{ my: 4, borderColor: "#E7E5E4" }} />
                  <Grid container spacing={4}>
                    {invoice.notes && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="#57534E" fontWeight={600} gutterBottom>
                          Notes:
                        </Typography>
                        <Typography variant="body2" color="#78716C">
                          {invoice.notes}
                        </Typography>
                      </Grid>
                    )}
                    {invoice.terms && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="#57534E" fontWeight={600} gutterBottom>
                          Terms & Conditions:
                        </Typography>
                        <Typography variant="body2" color="#78716C">
                          {invoice.terms}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card
            sx={{
              mb: 3,
              borderRadius: 4,
              border: "1px solid #E7E5E4",
              background: "linear-gradient(135deg, #FAFAF9 0%, #FFFFFF 100%)",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={700} color="#1C1917" gutterBottom>
                Payment Summary
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, py: 1 }}>
                <Typography color="#78716C" fontWeight={500}>Total Amount:</Typography>
                <Typography fontWeight={600} color="#1C1917">{formatCurrency(invoice.total)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2, py: 1 }}>
                <Typography color="#78716C" fontWeight={500}>Amount Paid:</Typography>
                <Typography color="#059669" fontWeight={600}>
                  {formatCurrency(invoice.amountPaid)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  pt: 2,
                  borderTop: "2px solid",
                  borderColor: "#E7E5E4",
                }}
              >
                <Typography fontWeight={700} color="#1C1917">Balance Due:</Typography>
                <Typography
                  fontWeight={700}
                  variant="h5"
                  color={invoice.balanceDue > 0 ? "#DC2626" : "#059669"}
                >
                  {formatCurrency(invoice.balanceDue)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {invoice.payments.length > 0 && (
            <Card sx={{ borderRadius: 4, border: "1px solid #E7E5E4" }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="h6" fontWeight={700} color="#1C1917" gutterBottom>
                  Payment History
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {invoice.payments.map((payment: Payment) => (
                    <Box
                      key={payment.id}
                      sx={{
                        p: 2.5,
                        borderRadius: 3,
                        backgroundColor: "#FAFAF9",
                        border: "1px solid #F5F5F4",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1.5,
                        }}
                      >
                        <Typography fontWeight={700} color="#1C1917" variant="h6">
                          {formatCurrency(payment.amount)}
                        </Typography>
                        <Chip
                          label={payment.status}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            fontSize: "0.6875rem",
                            backgroundColor:
                              payment.status === "COMPLETED"
                                ? "rgba(5, 150, 105, 0.1)"
                                : payment.status === "FAILED"
                                ? "rgba(220, 38, 38, 0.1)"
                                : "#F5F5F4",
                            color:
                              payment.status === "COMPLETED"
                                ? "#059669"
                                : payment.status === "FAILED"
                                ? "#DC2626"
                                : "#57534E",
                          }}
                        />
                      </Box>
                      <Typography variant="body2" color="#78716C" fontWeight={500}>
                        {PAYMENT_METHOD_LABELS[payment.method]}
                      </Typography>
                      <Typography variant="caption" color="#A8A29E" display="block" sx={{ mt: 0.5 }}>
                        {format(new Date(payment.createdAt), "MMM d, yyyy h:mm a")}
                      </Typography>
                      {payment.processedBy && (
                        <Typography variant="caption" color="#A8A29E" display="block" sx={{ mt: 0.5 }}>
                          Processed by: {payment.processedBy.name}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>

      <RecordPaymentModal
        open={paymentModalOpen}
        invoice={invoice}
        onClose={() => setPaymentModalOpen(false)}
        onSubmit={handleRecordPayment}
        loading={processingAction}
      />

      <Dialog
        open={voidDialogOpen}
        onClose={() => setVoidDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, color: "#1C1917" }}>
          Void Invoice
        </DialogTitle>
        <DialogContent>
          <Alert
            severity="warning"
            sx={{
              mb: 2,
              borderRadius: 3,
              backgroundColor: "rgba(217, 119, 6, 0.1)",
              color: "#92400E",
              "& .MuiAlert-icon": {
                color: "#D97706",
              },
            }}
          >
            This action cannot be undone. The invoice will be marked as cancelled.
          </Alert>
          <Typography color="#57534E">
            Are you sure you want to void invoice <strong>{invoice?.invoiceNumber}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 3, pt: 0 }}>
          <Button
            onClick={() => setVoidDialogOpen(false)}
            disabled={processingAction}
            sx={{
              color: "#57534E",
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleVoidInvoice}
            variant="contained"
            disabled={processingAction}
            sx={{
              backgroundColor: "#DC2626",
              fontWeight: 600,
              "&:hover": {
                backgroundColor: "#B91C1C",
              },
            }}
          >
            {processingAction ? "Voiding..." : "Void Invoice"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
