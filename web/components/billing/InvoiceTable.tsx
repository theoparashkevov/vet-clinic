"use client";

import { useState } from "react";
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Typography,
  Chip,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import PaymentIcon from "@mui/icons-material/Payment";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import type { Invoice } from "../../lib/billing/types";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import TableSkeleton from "../TableSkeleton";
import EmptyState from "../EmptyState";

interface InvoiceTableProps {
  invoices: Invoice[];
  loading?: boolean;
  onSend?: (invoice: Invoice) => void;
  onRecordPayment?: (invoice: Invoice) => void;
  emptyAction?: React.ReactNode;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export default function InvoiceTable({
  invoices,
  loading = false,
  onSend,
  onRecordPayment,
  emptyAction,
}: InvoiceTableProps) {
  const router = useRouter();

  if (loading) {
    return <TableSkeleton columns={7} headers={["Invoice #", "Patient", "Owner", "Date", "Total", "Status", "Actions"]} />;
  }

  if (invoices.length === 0) {
    return (
      <EmptyState
        title="No invoices found"
        description="Create your first invoice to get started with billing."
        action={emptyAction}
      />
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Invoice #</TableCell>
            <TableCell>Patient</TableCell>
            <TableCell>Owner</TableCell>
            <TableCell>Date</TableCell>
            <TableCell align="right">Total</TableCell>
            <TableCell>Status</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow
              key={invoice.id}
              hover
              sx={{ cursor: "pointer" }}
              onClick={() => router.push(`/admin/billing/invoices/${invoice.id}`)}
            >
              <TableCell>
                <Typography variant="body2" fontWeight={600}>
                  {invoice.invoiceNumber}
                </Typography>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">{invoice.patient.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {invoice.patient.species}
                    {invoice.patient.breed && ` • ${invoice.patient.breed}`}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">{invoice.owner.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {invoice.owner.email}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell>
                <Box>
                  <Typography variant="body2">
                    {format(new Date(invoice.issueDate), "MMM d, yyyy")}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Due: {format(new Date(invoice.dueDate), "MMM d, yyyy")}
                  </Typography>
                </Box>
              </TableCell>
              <TableCell align="right">
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {formatCurrency(invoice.total)}
                  </Typography>
                  {invoice.balanceDue > 0 && invoice.status !== "CANCELLED" && (
                    <Chip
                      label={`Due: ${formatCurrency(invoice.balanceDue)}`}
                      size="small"
                      color="warning"
                      variant="outlined"
                      sx={{ mt: 0.5 }}
                    />
                  )}
                </Box>
              </TableCell>
              <TableCell>
                <InvoiceStatusBadge status={invoice.status} />
              </TableCell>
              <TableCell align="center">
                <Box
                  sx={{ display: "flex", justifyContent: "center", gap: 0.5 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <Tooltip title="View">
                    <IconButton
                      size="small"
                      onClick={() => router.push(`/admin/billing/invoices/${invoice.id}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                  {invoice.status === "DRAFT" && (
                    <Tooltip title="Edit">
                      <IconButton
                        size="small"
                        onClick={() => router.push(`/admin/billing/invoices/${invoice.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {invoice.status === "DRAFT" && onSend && (
                    <Tooltip title="Send to Client">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onSend(invoice)}
                      >
                        <SendIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {(invoice.status === "SENT" || invoice.status === "PARTIAL" || invoice.status === "OVERDUE") && onRecordPayment && (
                    <Tooltip title="Record Payment">
                      <IconButton
                        size="small"
                        color="success"
                        onClick={() => onRecordPayment(invoice)}
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
  );
}
