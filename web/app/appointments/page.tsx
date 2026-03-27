"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Chip from "@mui/material/Chip";
import ViewListIcon from "@mui/icons-material/ViewList";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import BookingDialog from "../../components/BookingDialog";
import AppointmentDetailDialog from "../../components/AppointmentDetailDialog";
import CalendarView from "../../components/CalendarView";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import TableSkeleton from "../../components/TableSkeleton";
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

function statusColor(s: string): "default" | "success" | "warning" | "error" | "primary" {
  if (s === "completed") return "success";
  if (s === "cancelled") return "error";
  if (s === "in-progress") return "primary";
  return "default";
}

type ViewMode = "list" | "calendar";

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [doctorId, setDoctorId] = useState("");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const searchParams = new URLSearchParams();
      if (date) searchParams.set("date", date);
      if (doctorId) searchParams.set("doctorId", doctorId);
      const response = await apiJson<{ data: Appointment[]; meta: any }>(
        `/v1/appointments?${searchParams.toString()}`
      );
      setAppointments(response.data);
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
          disabled={loading}
        />
        <TextField
          select
          label="Doctor"
          size="small"
          value={doctorId}
          onChange={(e) => setDoctorId(e.target.value)}
          sx={{ minWidth: 200 }}
          disabled={loading}
        >
          <MenuItem value="">All doctors</MenuItem>
          {doctors.map((d) => (
            <MenuItem key={d.id} value={d.id}>
              {d.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* View Toggle */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
        >
          <ToggleButton value="list">
            <ViewListIcon sx={{ mr: 0.5 }} />
            List
          </ToggleButton>
          <ToggleButton value="calendar">
            <CalendarMonthIcon sx={{ mr: 0.5 }} />
            Calendar
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {loading ? (
        <TableSkeleton
          columns={6}
          headers={["Time", "Patient", "Owner", "Doctor", "Reason", "Status"]}
        />
      ) : error ? (
        <ErrorState
          title="Couldn't load appointments"
          message="Please check your connection and try again."
          details={error}
          onRetry={loadAppointments}
        />
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
      ) : viewMode === "calendar" ? (
        <CalendarView
          appointments={appointments}
          selectedDate={date}
          onDateChange={setDate}
          onAppointmentClick={(appt) => {
            setSelectedAppointment(appt);
            setDetailOpen(true);
          }}
          doctorFilter={doctorId || undefined}
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
                <TableRow
                  key={a.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => {
                    setSelectedAppointment(a);
                    setDetailOpen(true);
                  }}
                >
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

      <AppointmentDetailDialog
        appointment={selectedAppointment}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdated={() => {
          loadAppointments();
        }}
      />
    </Box>
  );
}
