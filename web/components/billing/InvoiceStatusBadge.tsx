"use client";

import Chip from "@mui/material/Chip";
import type { InvoiceStatus } from "../../lib/billing/types";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  size?: "small" | "medium";
}

const statusConfig: Record<
  InvoiceStatus,
  { label: string; color: "default" | "primary" | "success" | "warning" | "error" | "info" }
> = {
  DRAFT: { label: "Draft", color: "default" },
  SENT: { label: "Sent", color: "info" },
  PAID: { label: "Paid", color: "success" },
  PARTIAL: { label: "Partial", color: "warning" },
  OVERDUE: { label: "Overdue", color: "error" },
  CANCELLED: { label: "Cancelled", color: "default" },
  REFUNDED: { label: "Refunded", color: "warning" },
};

export default function InvoiceStatusBadge({ status, size = "small" }: InvoiceStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <Chip
      label={config.label}
      color={config.color}
      size={size}
      sx={{
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.025em",
        ...(status === "DRAFT" && {
          backgroundColor: "rgba(158, 158, 158, 0.15)",
          color: "text.secondary",
        }),
        ...(status === "CANCELLED" && {
          backgroundColor: "rgba(158, 158, 158, 0.15)",
          color: "text.secondary",
          textDecoration: "line-through",
        }),
      }}
    />
  );
}
