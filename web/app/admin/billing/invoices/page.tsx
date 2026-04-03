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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Pagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import PaymentIcon from "@mui/icons-material/Payment";
import WarningIcon from "@mui/icons-material/Warning";
import { format } from "date-fns";
import { apiJson, AuthError } from "../../../lib/api";
import type {
  Invoice,
  InvoiceStatus,
  InvoiceListResponse,
  InvoiceFilters,
} from "../../../lib/billing/types";
import InvoiceStatusBadge from "../../../components/billing/InvoiceStatusBadge";
import RecordPaymentModal from "../../../components/billing/RecordPaymentModal";
import PageHeader from "../../../components/PageHeader";
import TableSkeleton from "../../../components/TableSkeleton";
import EmptyState from "../../../components/EmptyState";
import ErrorState from "../../../components/ErrorState";
import { useToast } from "../../../components/ToastProvider";

const statusOptions: { value: InvoiceStatus | ""; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PAID", label: "Paid" },
  { value: "PARTIAL", label: "Partial" },
  { value: "OVERDUE", label: "Overdue" },
  { value: "CANCELLED", label: "Cancelled" },
  { value: "REFUNDED", label: "Refunded" },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function exportToCSV(invoices: Invoice[]): void {
  const headers = [
    "Invoice Number",
    "Patient",
    "Owner",
    "Issue Date",
    "Due Date",
    "Status",
    "Subtotal",
    "Tax",
    "Total",
    "Amount Paid",
    "Balance Due",
  ];

  const rows = invoices.map((inv) => [
    inv.invoiceNumber,
    inv.patient.name,
    inv.owner.name,
    format(new Date(inv.issueDate), "yyyy-MM-dd"),
    format(new Date(inv.dueDate), "yyyy-MM-dd"),
    inv.status,
    inv.subtotal,
    inv.taxAmount,
    inv.total,
    inv.amountPaid,
    inv.balanceDue,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `invoices-${format(new Date(), "yyyy-MM-dd")}.csv`;
  link.click();
}

export default function InvoicesListPage() {
  const router = useRouter();
  const toast = useToast();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [status, setStatus] = useState<InvoiceStatus | "">("");
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [processingAction, setProcessingAction] = useState(false);

  const fetchInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      if (status) params.set("status", status);
      if (search) params.set("search", search);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      if (overdueOnly) params.set("overdue", "true");

      const response = await apiJson<InvoiceListResponse>(
        `/v1/invoices?${params.toString()}`
      );

      setInvoices(response.data);
      setTotal(response.meta.total);
      setTotalPages(response.meta.totalPages);
    } catch (err) {
      if (err instanceof AuthError) return;
      setError(err instanceof Error ? err.message : "Failed to load invoices");
    } finally {
      setLoading(false);
    }
  }, [page, limit, status, search, startDate, endDate, overdueOnly]);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  const handleSearch = () => {
    setPage(1);
    fetchInvoices();
  };

  const handlePageChange = (_: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  const handleSendInvoice = async (invoice: Invoice) => {
    setProcessingAction(true);
    try {
      await apiJson(`/v1/invoices/${invoice.id}/send`, {
        method: "POST",
      });
      toast.success(`Invoice ${invoice.invoiceNumber} sent successfully`);
      fetchInvoices();
    } catch (err) {
      if (err instanceof AuthError) return;
      toast.error(err instanceof Error ? err.message : "Failed to send invoice");
    } finally {
      setProcessingAction(false);
    }
  };

  const handleRecordPayment = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setPaymentModalOpen(true);
  };

  const handlePaymentSubmit = async (data: {
    amount: number;
    method: string;
    notes?: string;
  }) => {
    if (!selectedInvoice) return;

    setProcessingAction(true);
    try {
      await apiJson("/v1/payments/record-offline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: data.amount,
          method: data.method,
          notes: data.notes,
        }),
      });
      toast.success("Payment recorded successfully");
      setPaymentModalOpen(false);
      fetchInvoices();
    } catch (err) {
      if (err instanceof AuthError) return;
      toast.error(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setProcessingAction(false);
    }
  };

  const actions = (
    <>
      <Button
        variant="outlined"
        startIcon={<FileDownloadIcon />}
        onClick={() => exportToCSV(invoices)}
        disabled={invoices.length === 0 || loading}
      >
        Export CSV
      </Button>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        component={Link}
        href="/admin/billing/invoices/new"
      >
        Create Invoice
      </Button>
    </>
  );

  return (
    <Box>
      <PageHeader
        title="Invoices"
        subtitle="Manage invoices, track payments, and send to clients"
        actions={actions}
      />

      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Search patient or owner"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Search..."
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <FormControl fullWidth size="small">
              <InputLabel>Status</InputLabel>
              <Select
                value={status}
                label="Status"
                onChange={(e) => {
                  setStatus(e.target.value as InvoiceStatus | "");
                  setPage(1);
                }}
              >
                {statusOptions.map((opt) => (
                  <MenuItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="From Date"
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <TextField
              fullWidth
              size="small"
              label="To Date"
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={2}>
            <ToggleButtonGroup
              value={overdueOnly}
              exclusive
              onChange={(_, value) => {
                setOverdueOnly(value);
                setPage(1);
              }}
              size="small"
              fullWidth
            >
              <ToggleButton value={false} sx={{ flex: 1 }}>
                All
              </ToggleButton>
              <ToggleButton
                value={true}
                sx={{
                  flex: 1,
                  color: overdueOnly ? "error.main" : "inherit",
                }}
              >
                <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                Overdue
              </ToggleButton>
            </ToggleButtonGroup>
          </Grid>
          <Grid item xs={12} sm={6} md={1}>
            <Button variant="outlined" fullWidth onClick={handleSearch}>
              Search
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* Content */}
      {loading ? (
        <TableSkeleton
          columns={7}
          headers={["Invoice #", "Patient", "Owner", "Date", "Total", "Status", "Actions"]}
        />
      ) : error ? (
        <ErrorState
          title="Couldn't load invoices"
          message="Please check your connection and try again."
          details={error}
          onRetry={fetchInvoices}
        />
      ) : invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Create your first invoice to get started with billing."
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              component={Link}
              href="/admin/billing/invoices/new"
            >
              Create Invoice
            </Button>
          }
        />
      ) : (
        <>
          <Box sx={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #e0e0e0" }}>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "#666",
                    }}
                  >
                    Invoice #
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "#666",
                    }}
                  >
                    Patient
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "#666",
                    }}
                  >
                    Owner
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "#666",
                    }}
                  >
                    Date
                  </th>
                  <th
                    style={{
                      textAlign: "right",
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "#666",
                    }}
                  >
                    Total
                  </th>
                  <th
                    style={{
                      textAlign: "left",
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "#666",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      textAlign: "center",
                      padding: "12px 16px",
                      fontWeight: 600,
                      color: "#666",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    style={{
                      borderBottom: "1px solid #f0f0f0",
                      cursor: "pointer",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f8f9fa")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                    onClick={() =>
                      router.push(`/admin/billing/invoices/${invoice.id}`)
                    }
                  >
                    <td style={{ padding: "12px 16px" }}>
                      <Typography variant="body2" fontWeight={600}>
                        {invoice.invoiceNumber}
                      </Typography>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Box>
                        <Typography variant="body2">
                          {invoice.patient.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.patient.species}
                          {invoice.patient.breed && ` • ${invoice.patient.breed}`}
                        </Typography>
                      </Box>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Box>
                        <Typography variant="body2">
                          {invoice.owner.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {invoice.owner.email}
                        </Typography>
                      </Box>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <Box>
                        <Typography variant="body2">
                          {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due: {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                        </Typography>
                      </Box>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <Box>
                        <Typography variant="body2" fontWeight={600}>
                          {formatCurrency(invoice.total)}
                        </Typography>
                        {invoice.balanceDue > 0 &&
                          invoice.status !== "CANCELLED" && (
                            <Chip
                              label={`Due: ${formatCurrency(invoice.balanceDue)}`}
                              size="small"
                              color="warning"
                              variant="outlined"
                              sx={{ mt: 0.5 }}
                            />
                          )}
                      </Box>
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <InvoiceStatusBadge status={invoice.status} />
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "center" }}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 0.5,
                        }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Tooltip title="View">
                          <IconButton
                            size="small"
                            onClick={() =>
                              router.push(`/admin/billing/invoices/${invoice.id}`)
                            }
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        {invoice.status === "DRAFT" && (
                          <Tooltip title="Edit">
                            <IconButton
                              size="small"
                              onClick={() =>
                                router.push(
                                  `/admin/billing/invoices/${invoice.id}/edit`
                                )
                              }
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {invoice.status === "DRAFT" && (
                          <Tooltip title="Send to Client">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleSendInvoice(invoice)}
                              disabled={processingAction}
                            >
                              <SendIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                        {(invoice.status === "SENT" ||
                          invoice.status === "PARTIAL" ||
                          invoice.status === "OVERDUE") && (
                          <Tooltip title="Record Payment">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleRecordPayment(invoice)}
                              disabled={processingAction}
                            >
                              <PaymentIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Box>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {invoices.length} of {total} invoices
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              disabled={loading}
            />
          </Box>
        </>
      )}

      {/* Payment Modal */}
      <RecordPaymentModal
        open={paymentModalOpen}
        invoice={selectedInvoice}
        onClose={() => {
          setPaymentModalOpen(false);
          setSelectedInvoice(null);
        }}
        onSubmit={handlePaymentSubmit}
        loading={processingAction}
      />
    </Box>
  );
}
