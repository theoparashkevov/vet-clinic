"use client";

import { useCallback, useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import BookingDialog from "../../components/BookingDialog";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

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
      const url = new URL(`${API}/v1/appointments`);
      if (date) url.searchParams.set("date", date);
      if (doctorId) url.searchParams.set("doctorId", doctorId);
      const res = await fetch(url.toString());
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setAppointments(await res.json());
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [date, doctorId]);

  // Load doctors once
  useEffect(() => {
    fetch(`${API}/v1/doctors`)
      .then((r) => r.json())
      .then(setDoctors)
      .catch(() => {});
  }, []);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Appointments
        </Typography>
        <Button variant="contained" onClick={() => setBookingOpen(true)}>
          Book Appointment
        </Button>
      </Box>

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
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Loading...</Typography>
        </Box>
      ) : appointments.length === 0 ? (
        <Typography color="text.secondary">No appointments found for the selected filters.</Typography>
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
    </Container>
  );
}
