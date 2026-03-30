"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import StepContent from "@mui/material/StepContent";
import Paper from "@mui/material/Paper";
import AppDialog from "./AppDialog";
import FormLayout from "./FormLayout";
import CreateReminderDialog from "./CreateReminderDialog";
import SMSSendDialog from "./SMSSendDialog";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

const APPOINTMENT_STATUSES = [
  "scheduled",
  "checked_in", 
  "in_progress", 
  "completed", 
  "cancelled", 
  "no_show"
];

const STATUS_WORKFLOW = [
  { status: "scheduled", label: "Scheduled", description: "Appointment is scheduled" },
  { status: "checked_in", label: "Checked In", description: "Patient has arrived" },
  { status: "in_progress", label: "In Progress", description: "Currently in exam room" },
  { status: "completed", label: "Completed", description: "Appointment finished" },
];

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
  if (s === "cancelled" || s === "no_show") return "error";
  if (s === "in_progress") return "primary";
  if (s === "checked_in") return "warning";
  return "default";
}

function getCurrentStep(status: string): number {
  const index = STATUS_WORKFLOW.findIndex(s => s.status === status);
  return index >= 0 ? index : 0;
}

export default function AppointmentDetailDialog({ appointment, open, onClose, onUpdated }: Props) {
  const toast = useToast();
  const [updating, setUpdating] = useState(false);
  const [newStatus, setNewStatus] = useState(appointment?.status ?? "scheduled");
  const [reminderDialogOpen, setReminderDialogOpen] = useState(false);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);

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
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to update status";
      toast.error(message);
    } finally {
      setUpdating(false);
    }
  };

  const handleQuickStatusUpdate = async (status: string) => {
    if (!appointment) return;

    setUpdating(true);
    try {
      await apiJson(`/v1/appointments/${appointment.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      setNewStatus(status);
      toast.success(`Status updated to ${status.replace("_", " ")}`);
      onUpdated();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      toast.error(e instanceof Error ? e.message : "Failed to update");
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

  const currentStep = getCurrentStep(appointment.status);
  const isCompleted = appointment.status === "completed";
  const isCancelled = appointment.status === "cancelled" || appointment.status === "no_show";

  return (
    <>
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
                  label={appointment.status.replace("_", " ")}
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

          {/* Workflow Status Stepper */}
          {!isCancelled && (
            <Paper variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2" gutterBottom>
                Appointment Workflow
              </Typography>
              <Stepper activeStep={currentStep} orientation="vertical">
                {STATUS_WORKFLOW.map((step, index) => (
                  <Step key={step.status}>
                    <StepLabel>{step.label}</StepLabel>
                    <StepContent>
                      <Typography variant="body2" color="text.secondary">
                        {step.description}
                      </Typography>
                      {appointment.status === step.status && index < STATUS_WORKFLOW.length - 1 && (
                        <Box sx={{ mt: 1 }}>
                          <Button
                            variant="contained"
                            size="small"
                            onClick={() => handleQuickStatusUpdate(STATUS_WORKFLOW[index + 1].status)}
                            disabled={updating}
                          >
                            Mark as {STATUS_WORKFLOW[index + 1].label}
                          </Button>
                        </Box>
                      )}
                    </StepContent>
                  </Step>
                ))}
              </Stepper>
            </Paper>
          )}

          {/* Quick Actions */}
          {isCompleted && (
            <Paper variant="outlined" sx={{ p: 2, bgcolor: "success.light" }}>
              <Typography variant="subtitle2" gutterBottom>
                Follow-up Actions
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setReminderDialogOpen(true)}
                fullWidth
                sx={{ mb: 1 }}
              >
                Create Follow-up Reminder
              </Button>
              <Button
                variant="outlined"
                color="primary"
                onClick={() => setSmsDialogOpen(true)}
                fullWidth
              >
                Send SMS Confirmation
              </Button>
            </Paper>
          )}

          <TextField
            select
            label="Manual Status Update"
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            fullWidth
            size="small"
          >
            {APPOINTMENT_STATUSES.map((status) => (
              <MenuItem key={status} value={status}>
                {status.replace("_", " ").replace(/\b\w/g, l => l.toUpperCase())}
              </MenuItem>
            ))}
          </TextField>
        </FormLayout>
      </AppDialog>

      <CreateReminderDialog
        open={reminderDialogOpen}
        patientId={appointment.patient.id}
        patientName={appointment.patient.name}
        appointmentId={appointment.id}
        onClose={() => setReminderDialogOpen(false)}
        onCreated={() => {
          setReminderDialogOpen(false);
          toast.success("Follow-up reminder created");
        }}
      />

      <SMSSendDialog
        open={smsDialogOpen}
        onClose={() => setSmsDialogOpen(false)}
        appointmentId={appointment.id}
      />
    </>
  );
}
