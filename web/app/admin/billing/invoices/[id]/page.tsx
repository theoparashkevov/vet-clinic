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
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import PaymentIcon from "@mui/icons-material/Payment";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import BlockIcon from "@mui/icons-material/Block";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import { format } from "date-fns";
import { apiJson, AuthError } from "../../../../lib/api";
import type { Invoice, Payment } from "../../../../lib/billing/types";
import { PAYMENT_METHOD_LABELS, SERVICE_TYPE_LABELS } from "../../../../lib/billing/types";
import InvoiceStatusBadge from "../../../../components/billing/InvoiceStatusBadge";
import RecordPaymentModal from "../../../../components/billing/RecordPaymentModal";
import { useToast } from "../../../../components/ToastProvider";

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
        <Skeleton variant="rectangular" height={60} sx={{ mb: 3 }} />
        <Skeleton variant="rectangular" height={400} />
      </Box>
    );
  }

  if (error || !invoice) {
    return (
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin/billing/invoices")}
          sx={{ mb: 2 }}
        >
          Back to Invoices
        </Button>
        <Alert severity="error">
          {error || "Invoice not found"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/admin/billing/invoices")}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1" sx={{ flex: 1 }}>
          Invoice {invoice.invoiceNumber}
        </Typography>
        <InvoiceStatusBadge status={invoice.status} size="medium" />
      </Box>

      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {canEdit && (
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            component={Link}
            href={`/admin/billing/invoices/${invoice.id}/edit`}
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
          >
            Send to Client
          </Button>
        )}
        {canRecordPayment && (
          <Button
            variant="contained"
            color="success"
            startIcon={<PaymentIcon />}
            onClick={() => setPaymentModalOpen(true)}
            disabled={processingAction}
          >
            Record Payment
          </Button>
        )}
        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          disabled
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
          >
            Void
          </Button>
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
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
                    {invoice.invoiceNumber}
                  </Typography>
                </Box>
              </Box>

              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Billed To:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {invoice.owner.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoice.owner.email}
                  </Typography>
                  {invoice.owner.phone && (
                    <Typography variant="body2" color="text.secondary">
                      {invoice.owner.phone}
                    </Typography>
                  )}
                  {invoice.owner.address && (
                    <Typography variant="body2" color="text.secondary">
                      {invoice.owner.address}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Patient:
                  </Typography>
                  <Typography variant="body1" fontWeight={600}>
                    {invoice.patient.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {invoice.patient.species}
                    {invoice.patient.breed && ` • ${invoice.patient.breed}`}
                  </Typography>
                </Grid>
              </Grid>

              <Grid container spacing={4} sx={{ mb: 4 }}>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Issue Date
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Due Date
                  </Typography>
                  <Typography
                    variant="body2"
                    fontWeight={600}
                    color={invoice.status === "OVERDUE" ? "error" : "inherit"}
                  >
                    {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Created By
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {invoice.createdBy.name}
                  </Typography>
                </Grid>
                <Grid item xs={6} sm={3}>
                  <Typography variant="caption" color="text.secondary">
                    Status
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <InvoiceStatusBadge status={invoice.status} size="small" />
                  </Box>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Line Items
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell>Description</TableCell>
                      <TableCell align="right">Qty</TableCell>
                      <TableCell align="right">Unit Price</TableCell>
                      <TableCell align="right">Total</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {invoice.items.map((item: Invoice["items"][0]) => (
                      <TableRow key={item.id}>
                        <TableCell>{SERVICE_TYPE_LABELS[item.serviceType]}</TableCell>
                        <TableCell>{item.description}</TableCell>
                        <TableCell align="right">{item.quantity}</TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.unitPrice)}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(item.total)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
                <Box sx={{ width: 300 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">Subtotal:</Typography>
                    <Typography>{formatCurrency(invoice.subtotal)}</Typography>
                  </Box>
                  {invoice.taxAmount > 0 && (
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                      <Typography color="text.secondary">
                        Tax ({(invoice.taxRate * 100).toFixed(2)}%):
                      </Typography>
                      <Typography>{formatCurrency(invoice.taxAmount)}</Typography>
                    </Box>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography fontWeight={600}>Total:</Typography>
                    <Typography fontWeight={600}>
                      {formatCurrency(invoice.total)}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                    <Typography color="text.secondary">Amount Paid:</Typography>
                    <Typography color="success.main">
                      {formatCurrency(invoice.amountPaid)}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      pt: 1,
                      borderTop: "2px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography fontWeight={700}>Balance Due:</Typography>
                    <Typography
                      fontWeight={700}
                      color={invoice.balanceDue > 0 ? "error.main" : "success.main"}
                    >
                      {formatCurrency(invoice.balanceDue)}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              {(invoice.notes || invoice.terms) && (
                <>
                  <Divider sx={{ my: 3 }} />
                  <Grid container spacing={3}>
                    {invoice.notes && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Notes:
                        </Typography>
                        <Typography variant="body2">{invoice.notes}</Typography>
                      </Grid>
                    )}
                    {invoice.terms && (
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                          Terms & Conditions:
                        </Typography>
                        <Typography variant="body2">{invoice.terms}</Typography>
                      </Grid>
                    )}
                  </Grid>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Payment Summary
              </Typography>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography color="text.secondary">Total Amount:</Typography>
                <Typography fontWeight={600}>{formatCurrency(invoice.total)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
                <Typography color="text.secondary">Amount Paid:</Typography>
                <Typography color="success.main" fontWeight={600}>
                  {formatCurrency(invoice.amountPaid)}
                </Typography>
              </Box>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  pt: 2,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography fontWeight={700}>Balance Due:</Typography>
                <Typography
                  fontWeight={700}
                  variant="h6"
                  color={invoice.balanceDue > 0 ? "error.main" : "success.main"}
                >
                  {formatCurrency(invoice.balanceDue)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {invoice.payments.length > 0 && (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Payment History
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {invoice.payments.map((payment: Payment) => (
                    <Box
                      key={payment.id}
                      sx={{
                        p: 2,
                        borderRadius: 1,
                        backgroundColor: "background.default",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          mb: 1,
                        }}
                      >
                        <Typography fontWeight={600}>
                          {formatCurrency(payment.amount)}
                        </Typography>
                        <Chip
                          label={payment.status}
                          size="small"
                          color={
                            payment.status === "COMPLETED"
                              ? "success"
                              : payment.status === "FAILED"
                              ? "error"
                              : "default"
                          }
                        />
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {PAYMENT_METHOD_LABELS[payment.method]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(new Date(payment.createdAt), "MMM d, yyyy h:mm a")}
                      </Typography>
                      {payment.processedBy && (
                        <Typography variant="caption" color="text.secondary" display="block">
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

      <Dialog open={voidDialogOpen} onClose={() => setVoidDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Void Invoice</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action cannot be undone. The invoice will be marked as cancelled.
          </Alert>
          <Typography>
            Are you sure you want to void invoice <strong>{invoice?.invoiceNumber}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVoidDialogOpen(false)} disabled={processingAction}>
            Cancel
          </Button>
          <Button
            onClick={handleVoidInvoice}
            color="error"
            variant="contained"
            disabled={processingAction}
          >
            {processingAction ? "Voiding..." : "Void Invoice"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
