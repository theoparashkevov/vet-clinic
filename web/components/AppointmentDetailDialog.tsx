"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import AppDialog from "./AppDialog";
import FormLayout from "./FormLayout";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

const APPOINTMENT_STATUSES = ["scheduled", "in-progress", "completed", "cancelled", "no-show"];

type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  status: string;
  patient: { id: string; name: string; species: string };
  owner: { id: string; name: string };
  doctor: { id: string; name: string } | null;
};

type Props = {
  appointment: Appointment | null;
  open: boolean;
  onClose: () => void;
  onUpdated: () => void;
};

function statusColor(s: string): "default" | "success" | "warning" | "error" | "primary" {
  if (s === "completed") return "success";
  if (s === "cancelled" || s === "no-show") return "error";
  if (s === "in-progress") return "primary";
  return "default";
}

export default function AppointmentDetailDialog({ appointment, open, onClose, onUpdated }: Props) {
  const toast = useToast();
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(appointment?.status ?? "scheduled");

  // Reset status when appointment changes
  if (appointment && newStatus !== appointment.status && !updating) {
    setNewStatus(appointment.status);
  }

  const handleUpdateStatus = async () => {
    if (!appointment || newStatus === appointment.status) return;

    setUpdating(true);
    try {
      await apiJson(`/v1/appointments/${appointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      toast.success("Appointment status updated");
      onUpdated();
      onClose();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to update status";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  if (!appointment) return null;

  const startTime = new Date(appointment.startsAt);
  const endTime = new Date(appointment.endsAt);
  const dateStr = startTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const timeStr = `${startTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} - ${endTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;

  return (
    <AppDialog
      open={open}
      title="Appointment Details"
      subtitle={`${dateStr} • ${timeStr}`}
      onClose={onClose}
      maxWidth="sm"
      actions={
        <>
          <Button onClick={onClose}>Close</Button>
          <Button
            variant="contained"
            onClick={handleUpdateStatus}
            disabled={updating || newStatus === appointment.status}
          >
            Update Status
          </Button>
        </>
      }
    >
      <FormLayout>
        <Box sx={{ display: "grid", gap: 2, gridTemplateColumns: "1fr 1fr" }}>
          <Box>
            <Typography variant="caption" color="text.secondary">
              Patient
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {appointment.patient.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {appointment.patient.species}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Owner
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {appointment.owner.name}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Doctor
            </Typography>
            <Typography variant="body1" fontWeight={500}>
              {appointment.doctor?.name ?? "Not assigned"}
            </Typography>
          </Box>

          <Box>
            <Typography variant="caption" color="text.secondary">
              Current Status
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                label={appointment.status}
                size="small"
                color={statusColor(appointment.status)}
              />
            </Box>
          </Box>
        </Box>

        {appointment.reason && (
          <Box>
            <Typography variant="caption" color="text.secondary">
              Reason
            </Typography>
            <Typography variant="body1">{appointment.reason}</Typography>
          </Box>
        )}

        <TextField
          select
          label="Update Status"
          value={newStatus}
          onChange={(e) => setNewStatus(e.target.value)}
          fullWidth
          size="small"
        >
          {APPOINTMENT_STATUSES.map((status) => (
            <MenuItem key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </MenuItem>
          ))}
        </TextField>
      </FormLayout>
    </AppDialog>
  );
}
