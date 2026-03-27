"use client";

import { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Chip from "@mui/material/Chip";
import { apiJson } from "../lib/api";

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

type Patient = {
  id: string;
  name: string;
};

function statusColor(s: string): "default" | "success" | "warning" | "error" {
  if (s === "completed") return "success";
  if (s === "cancelled") return "error";
  return "default";
}

export default function DashboardPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [patientCount, setPatientCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const today = new Date().toISOString().slice(0, 10);

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [apptRes, patRes] = await Promise.all([
          apiJson<Appointment[]>(`/v1/appointments?date=${today}`),
          apiJson<Patient[]>("/v1/patients"),
        ]);
        if (!cancelled) {
          setAppointments(apptRes);
          setPatientCount(patRes.length);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {loading ? (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={20} />
          <Typography>Loading...</Typography>
        </Box>
      ) : (
        <>
          {/* Quick stats */}
          <Box sx={{ display: "flex", gap: 3, mb: 4 }}>
            <Paper sx={{ p: 3, flex: 1, textAlign: "center" }}>
              <Typography variant="h3" color="primary">
                {appointments.length}
              </Typography>
              <Typography color="text.secondary">
                Appointments Today
              </Typography>
            </Paper>
            <Paper sx={{ p: 3, flex: 1, textAlign: "center" }}>
              <Typography variant="h3" color="primary">
                {patientCount ?? 0}
              </Typography>
              <Typography color="text.secondary">
                Total Patients
              </Typography>
            </Paper>
          </Box>

          {/* Today's appointments */}
          <Typography variant="h5" gutterBottom>
            Today&apos;s Appointments
          </Typography>

          {appointments.length === 0 ? (
            <Typography color="text.secondary">
              No appointments scheduled for today.
            </Typography>
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
        </>
      )}
    </Container>
  );
}
