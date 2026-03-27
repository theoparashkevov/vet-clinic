"use client";

import { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Stepper from "@mui/material/Stepper";
import Step from "@mui/material/Step";
import StepLabel from "@mui/material/StepLabel";
import CircularProgress from "@mui/material/CircularProgress";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";

type Doctor = { id: string; name: string };
type Patient = { id: string; name: string; species: string; ownerId: string; owner: { id: string; name: string } };

type Props = {
  open: boolean;
  preselectedPatientId?: string;
  preselectedOwnerId?: string;
  onClose: () => void;
  onBooked: () => void;
};

const steps = ["Select Doctor & Date", "Choose Time Slot", "Patient & Reason"];

export default function BookingDialog({
  open,
  preselectedPatientId,
  preselectedOwnerId,
  onClose,
  onBooked,
}: Props) {
  const toast = useToast();
  const [activeStep, setActiveStep] = useState(0);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [slots, setSlots] = useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [doctorId, setDoctorId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [patientId, setPatientId] = useState(preselectedPatientId ?? "");
  const [reason, setReason] = useState("");

  // Load doctors and patients on open
  useEffect(() => {
    if (!open) return;
    setActiveStep(0);
    setSelectedSlot(null);
    setSlots([]);
    setError(null);
    setReason("");
    setPatientId(preselectedPatientId ?? "");
    setDoctorId("");
    setDate(new Date().toISOString().slice(0, 10));

    Promise.all([
      apiJson<Doctor[]>("/v1/doctors"),
      apiJson<Patient[]>("/v1/patients"),
    ]).then(([docs, pats]) => {
      setDoctors(docs);
      setPatients(pats);
    }).catch(() => {
      // Auth/session handling is done globally.
    });
  }, [open, preselectedPatientId]);

  const loadSlots = async () => {
    setLoadingSlots(true);
    setError(null);
    setSlots([]);
    try {
      const searchParams = new URLSearchParams({ date });
      if (doctorId) searchParams.set("doctorId", doctorId);
      const data = await apiJson<{ slots?: string[] }>(`/v1/appointments/slots?${searchParams.toString()}`);
      setSlots(data.slots ?? []);
      setActiveStep(1);
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to load slots";
      setError(message);
      toast.error(message);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleSelectSlot = (slot: string) => {
    setSelectedSlot(slot);
    setActiveStep(2);
  };

  const handleBook = async () => {
    if (!selectedSlot || !patientId) return;
    setSubmitting(true);
    setError(null);
    try {
      const slotStart = new Date(selectedSlot);
      const slotEnd = new Date(slotStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + 30);

      // Find owner from selected patient
      const pat = patients.find((p) => p.id === patientId);
      const ownerId = preselectedOwnerId ?? pat?.ownerId ?? pat?.owner?.id;
      if (!ownerId) throw new Error("Could not determine owner");

      const body = {
        patientId,
        ownerId,
        doctorId: doctorId || undefined,
        startsAt: slotStart.toISOString(),
        endsAt: slotEnd.toISOString(),
        reason: reason || undefined,
      };

      await apiJson(`/v1/appointments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      toast.success("Appointment booked");
      onBooked();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to book";
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Book Appointment</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3, mt: 1 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {/* Step 1: Doctor & Date */}
        {activeStep === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              select
              label="Doctor"
              value={doctorId}
              onChange={(e) => setDoctorId(e.target.value)}
            >
              <MenuItem value="">Any doctor</MenuItem>
              {doctors.map((d) => (
                <MenuItem key={d.id} value={d.id}>
                  {d.name}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
            <Button
              variant="contained"
              onClick={loadSlots}
              disabled={loadingSlots || !date}
            >
              {loadingSlots ? (
                <><CircularProgress size={18} sx={{ mr: 1 }} /> Loading...</>
              ) : (
                "Show Available Slots"
              )}
            </Button>
          </Box>
        )}

        {/* Step 2: Select slot */}
        {activeStep === 1 && (
          <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
              <Typography variant="subtitle1">
                Available slots for {date}
              </Typography>
              <Button size="small" onClick={() => setActiveStep(0)}>
                Back
              </Button>
            </Box>
            {slots.length === 0 ? (
              <Typography color="text.secondary">
                No available slots. Try a different date or doctor.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {slots.map((s) => (
                  <Chip
                    key={s}
                    label={new Date(s).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    onClick={() => handleSelectSlot(s)}
                    color={selectedSlot === s ? "primary" : "default"}
                    variant={selectedSlot === s ? "filled" : "outlined"}
                    sx={{ cursor: "pointer" }}
                  />
                ))}
              </Box>
            )}
          </Box>
        )}

        {/* Step 3: Patient & Reason */}
        {activeStep === 2 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="subtitle1">
                Selected: {date} at{" "}
                {selectedSlot
                  ? new Date(selectedSlot).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </Typography>
              <Button size="small" onClick={() => setActiveStep(1)}>
                Back
              </Button>
            </Box>
            <TextField
              select
              label="Patient"
              required
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              disabled={!!preselectedPatientId}
            >
              {patients.map((p) => (
                <MenuItem key={p.id} value={p.id}>
                  {p.name} ({p.species}) — {p.owner?.name ?? ""}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              label="Reason"
              multiline
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        {activeStep === 2 && (
          <Button
            variant="contained"
            disabled={submitting || !patientId || !selectedSlot}
            onClick={handleBook}
          >
            {submitting ? "Booking..." : "Book Appointment"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
