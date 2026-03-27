"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import BookingDialog from "../../components/BookingDialog";
import PageHeader from "../../components/PageHeader";
import InlineLoading from "../../components/InlineLoading";
import EmptyState from "../../components/EmptyState";
import { apiJson, AuthError } from "../../lib/api";

type Doctor = { id: string; name: string };
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

function statusColor(s: string): "default" | "success" | "warning" | "error" {
  if (s === "completed") return "success";
  if (s === "cancelled") return "error";
  return "default";
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [doctorId, setDoctorId] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (date) searchParams.set("date", date);
      if (doctorId) searchParams.set("doctorId", doctorId);
      setAppointments(await apiJson<Appointment[]>(`/v1/appointments?${searchParams.toString()}`));
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [date, doctorId]);

  // Load doctors once
  useEffect(() => {
    apiJson<Doctor[]>("/v1/doctors")
      .then(setDoctors)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return (
    <Box>
      <PageHeader
        title="Appointments"
        subtitle="Filter by date and doctor, then book new appointments"
        actions={
          <Button variant="contained" onClick={() => setBookingOpen(true)}>
            Book appointment
          </Button>
        }
      />

      {/* Filters */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        <TextField
          label="Date"
          type="date"
          size="small"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ minWidth: 180 }}
        />
        <TextField
          select
          label="Doctor"
          size="small"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          sx={{ minWidth: 200 }}
        >
          <MenuItem value="">All doctors</MenuItem>
          {doctors.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <InlineLoading />
      ) : appointments.length === 0 ? (
        <EmptyState
          title="No appointments"
          description="Try a different date/doctor or book a new appointment."
          action={
            <Button variant="contained" onClick={() => setBookingOpen(true)}>
              Book appointment
            </Button>
          }
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Time</TableCell>
                <TableCell>Patient</TableCell>
                <TableCell>Owner</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>
                    {new Date(a.startsAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" - "}
                    {new Date(a.endsAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </TableCell>
                  <TableCell>{a.patient.name}</TableCell>
                  <TableCell>{a.owner.name}</TableCell>
                  <TableCell>{a.doctor?.name ?? "—"}</TableCell>
                  <TableCell>{a.reason ?? "—"}</TableCell>
                  <TableCell>
                    <Chip
                      label={a.status}
                      size="small"
                      color={statusColor(a.status)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <BookingDialog
        open={bookingOpen}
        onClose={() => setBookingOpen(false)}
        onBooked={() => {
          setBookingOpen(false);
          loadAppointments();
        }}
      />
    </Box>
  );
}
