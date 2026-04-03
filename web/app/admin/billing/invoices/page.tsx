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
  Card,
  CardContent,
  Avatar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import PaymentIcon from "@mui/icons-material/Payment";
import WarningIcon from "@mui/icons-material/Warning";
import SearchIcon from "@mui/icons-material/Search";
import ReceiptIcon from "@mui/icons-material/Receipt";
import { format } from "date-fns";
import { apiJson, AuthError } from "../../../../lib/api";
import type {
  Invoice,
  InvoiceStatus,
  InvoiceListResponse,
} from "../../../../lib/billing/types";
import InvoiceStatusBadge from "../../../../components/billing/InvoiceStatusBadge";
import RecordPaymentModal from "../../../../components/billing/RecordPaymentModal";
import PageHeader from "../../../../components/PageHeader";
import TableSkeleton from "../../../../components/TableSkeleton";
import EmptyState from "../../../../components/EmptyState";
import ErrorState from "../../../../components/ErrorState";
import { useToast } from "../../../../components/ToastProvider";

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
        Export CSV
      </Button>
      <Button
        variant="contained"
        startIcon={<AddIcon />}
        component={Link}
        href="/admin/billing/invoices/new"
        sx={{
          backgroundColor: "#0D7377",
          fontWeight: 600,
          "&:hover": {
            backgroundColor: "#0A5A5D",
          },
        }}
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

      <Card
        sx={{
          mb: 3,
          borderRadius: 4,
          border: "1px solid #E7E5E4",
        }}
      >
        <CardContent sx={{ p: 3 }}>
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
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: "#A8A29E", mr: 1, fontSize: 20 }} />,
                }}
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
                sx={{
                  backgroundColor: "#F5F5F4",
                  borderRadius: 2,
                  p: 0.5,
                }}
              >
                <ToggleButton
                  value={false}
                  sx={{
                    flex: 1,
                    border: "none",
                    borderRadius: 1.5,
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    "&.Mui-selected": {
                      backgroundColor: "#FFFFFF",
                      color: "#1C1917",
                      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
                    },
                  }}
                >
                  All
                </ToggleButton>
                <ToggleButton
                  value={true}
                  sx={{
                    flex: 1,
                    border: "none",
                    borderRadius: 1.5,
                    fontWeight: 600,
                    fontSize: "0.8125rem",
                    color: overdueOnly ? "#DC2626" : "#57534E",
                    "&.Mui-selected": {
                      backgroundColor: "rgba(220, 38, 38, 0.1)",
                      color: "#DC2626",
                    },
                  }}
                >
                  <WarningIcon fontSize="small" sx={{ mr: 0.5 }} />
                  Overdue
                </ToggleButton>
              </ToggleButtonGroup>
            </Grid>
            <Grid item xs={12} sm={6} md={1}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleSearch}
                sx={{
                  borderColor: "#0D7377",
                  color: "#0D7377",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#0A5A5D",
                    backgroundColor: "rgba(13, 115, 119, 0.04)",
                  },
                }}
              >
                Search
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

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
              sx={{
                backgroundColor: "#0D7377",
                "&:hover": {
                  backgroundColor: "#0A5A5D",
                },
              }}
            >
              Create Invoice
            </Button>
          }
        />
      ) : (
        <>
          <Card
            sx={{
              borderRadius: 4,
              border: "1px solid #E7E5E4",
              overflow: "hidden",
            }}
          >
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: "#FAFAF9" }}>
                    <TableCell sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                      Invoice #
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                      Patient
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                      Owner
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                      Date
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                      Total
                    </TableCell>
                    <TableCell sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                      Status
                    </TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700, color: "#57534E", fontSize: "0.75rem", letterSpacing: "0.025em", textTransform: "uppercase" }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      hover
                      onClick={() => router.push(`/admin/billing/invoices/${invoice.id}`)}
                      sx={{
                        cursor: "pointer",
                        transition: "background-color 0.15s ease",
                        "&:hover": {
                          backgroundColor: "#FAFAF9",
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <Avatar
                            sx={{
                              width: 32,
                              height: 32,
                              bgcolor: "rgba(13, 115, 119, 0.1)",
                              color: "#0D7377",
                              fontSize: "0.875rem",
                              fontWeight: 600,
                            }}
                          >
                            <ReceiptIcon fontSize="small" />
                          </Avatar>
                          <Typography variant="body2" fontWeight={600} color="#1C1917">
                            {invoice.invoiceNumber}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500} color="#1C1917">
                            {invoice.patient.name}
                          </Typography>
                          <Typography variant="caption" color="#78716C">
                            {invoice.patient.species}
                            {invoice.patient.breed && ` • ${invoice.patient.breed}`}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500} color="#1C1917">
                            {invoice.owner.name}
                          </Typography>
                          <Typography variant="caption" color="#78716C">
                            {invoice.owner.email}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" color="#1C1917">
                            {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                          </Typography>
                          <Typography variant="caption" color="#A8A29E">
                            Due: {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Box>
                          <Typography variant="body2" fontWeight={600} color="#1C1917">
                            {formatCurrency(invoice.total)}
                          </Typography>
                          {invoice.balanceDue > 0 && invoice.status !== "CANCELLED" && (
                            <Chip
                              label={`Due: ${formatCurrency(invoice.balanceDue)}`}
                              size="small"
                              sx={{
                                mt: 0.5,
                                backgroundColor: "rgba(217, 119, 6, 0.1)",
                                color: "#D97706",
                                fontWeight: 600,
                                fontSize: "0.6875rem",
                              }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <InvoiceStatusBadge status={invoice.status} />
                      </TableCell>
                      <TableCell align="center">
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
                              onClick={() => router.push(`/admin/billing/invoices/${invoice.id}`)}
                              sx={{
                                color: "#57534E",
                                "&:hover": {
                                  backgroundColor: "rgba(13, 115, 119, 0.08)",
                                  color: "#0D7377",
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {invoice.status === "DRAFT" && (
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() =>
                                  router.push(`/admin/billing/invoices/${invoice.id}/edit`)
                                }
                                sx={{
                                  color: "#57534E",
                                  "&:hover": {
                                    backgroundColor: "rgba(13, 115, 119, 0.08)",
                                    color: "#0D7377",
                                  },
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          {invoice.status === "DRAFT" && (
                            <Tooltip title="Send to Client">
                              <IconButton
                                size="small"
                                onClick={() => handleSendInvoice(invoice)}
                                disabled={processingAction}
                                sx={{
                                  color: "#0D7377",
                                  "&:hover": {
                                    backgroundColor: "rgba(13, 115, 119, 0.12)",
                                  },
                                }}
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
                                onClick={() => handleRecordPayment(invoice)}
                                disabled={processingAction}
                                sx={{
                                  color: "#059669",
                                  "&:hover": {
                                    backgroundColor: "rgba(5, 150, 105, 0.12)",
                                  },
                                }}
                              >
                                <PaymentIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 3,
              px: 1,
            }}
          >
            <Typography variant="body2" color="#78716C" fontWeight={500}>
              Showing {invoices.length} of {total} invoices
            </Typography>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              disabled={loading}
              sx={{
                "& .MuiPaginationItem-root": {
                  borderRadius: 2,
                  fontWeight: 600,
                },
                "& .Mui-selected": {
                  backgroundColor: "#0D7377",
                  color: "#FFFFFF",
                },
              }}
            />
          </Box>
        </>
      )}

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
