"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import MedicalRecordDialog from "../../../components/MedicalRecordDialog";
import BookingDialog from "../../../components/BookingDialog";
import PageHeader from "../../../components/PageHeader";
import InlineLoading from "../../../components/InlineLoading";
import EmptyState from "../../../components/EmptyState";
import { apiJson, AuthError } from "../../../lib/api";

type Owner = { id: string; name: string; phone: string; email: string | null };
type Patient = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  birthdate: string | null;
  microchipId: string | null;
  allergies: string | null;
  chronicConditions: string | null;
  notes: string | null;
  ownerId: string;
  owner: Owner;
};

type MedicalRecord = {
  id: string;
  visitDate: string;
  summary: string;
  diagnoses: string | null;
  treatments: string | null;
  prescriptions: string | null;
};

type Appointment = {
  id: string;
  startsAt: string;
  endsAt: string;
  reason: string | null;
  status: string;
  doctor: { id: string; name: string } | null;
};

function statusColor(s: string): "default" | "success" | "warning" | "error" {
  if (s === "completed") return "success";
  if (s === "cancelled") return "error";
  return "default";
}

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;


  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pat, recs, patAppts] = await Promise.all([
        apiJson<Patient>(`/v1/patients/${id}`),
        apiJson<MedicalRecord[]>(`/v1/patients/${id}/medical-records`),
        apiJson<Appointment[]>(`/v1/appointments?patientId=${encodeURIComponent(id)}`),
      ]);
      setPatient(pat);
      setRecords(recs);
      setAppointments(patAppts);
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <InlineLoading />
    );
  }

  if (error || !patient) {
    return (
      <Alert severity="error">{error ?? "Patient not found"}</Alert>
    );
  }

  return (
    <Box>
      <PageHeader
        title={patient.name}
        subtitle={`${patient.species}${patient.breed ? ` • ${patient.breed}` : ""}`}
        actions={
          <>
            <Button variant="outlined" onClick={() => setRecordDialogOpen(true)}>
              Add medical record
            </Button>
            <Button variant="contained" onClick={() => setBookingDialogOpen(true)}>
              Book appointment
            </Button>
          </>
        }
      />

      <Box sx={{ display: "flex", gap: 3, mb: 4, flexWrap: "wrap" }}>
        {/* Patient details card */}
        <Paper sx={{ p: 3, flex: 1, minWidth: 300 }}>
          <Typography variant="h6" gutterBottom>Patient Info</Typography>
          <InfoRow label="Species" value={patient.species} />
          <InfoRow label="Breed" value={patient.breed} />
          <InfoRow label="Birthdate" value={patient.birthdate ? new Date(patient.birthdate).toLocaleDateString() : null} />
          <InfoRow label="Microchip" value={patient.microchipId} />
          <InfoRow label="Allergies" value={patient.allergies} />
          <InfoRow label="Chronic Conditions" value={patient.chronicConditions} />
          {patient.notes && <InfoRow label="Notes" value={patient.notes} />}
        </Paper>

        {/* Owner card */}
        <Paper sx={{ p: 3, flex: 1, minWidth: 250 }}>
          <Typography variant="h6" gutterBottom>Owner</Typography>
          <InfoRow label="Name" value={patient.owner.name} />
          <InfoRow label="Phone" value={patient.owner.phone} />
          <InfoRow label="Email" value={patient.owner.email} />
        </Paper>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Medical History */}
      <Typography variant="h5" gutterBottom>
        Medical History
      </Typography>
      {records.length === 0 ? (
        <Box sx={{ mb: 3 }}>
          <EmptyState
            title="No medical records yet"
            description="Add a visit summary to start building a clinical history."
            action={
              <Button variant="contained" onClick={() => setRecordDialogOpen(true)}>
                Add medical record
              </Button>
            }
          />
        </Box>
      ) : (
        <Box sx={{ mb: 3 }}>
          {records.map((r) => (
            <Paper key={r.id} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography variant="subtitle1" fontWeight="bold">
                  {new Date(r.visitDate).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography>{r.summary}</Typography>
              {r.diagnoses && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>Diagnoses:</strong> {r.diagnoses}
                </Typography>
              )}
              {r.treatments && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>Treatments:</strong> {r.treatments}
                </Typography>
              )}
              {r.prescriptions && (
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  <strong>Prescriptions:</strong> {r.prescriptions}
                </Typography>
              )}
            </Paper>
          ))}
        </Box>
      )}

      <Divider sx={{ mb: 3 }} />

      {/* Past Appointments */}
      <Typography variant="h5" gutterBottom>
        Appointments
      </Typography>
      {appointments.length === 0 ? (
        <EmptyState
          title="No appointments"
          description="Book the next visit to keep care on track."
          action={
            <Button variant="contained" onClick={() => setBookingDialogOpen(true)}>
              Book appointment
            </Button>
          }
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Doctor</TableCell>
                <TableCell>Reason</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {appointments.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{new Date(a.startsAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    {new Date(a.startsAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </TableCell>
                  <TableCell>{a.doctor?.name ?? "—"}</TableCell>
                  <TableCell>{a.reason ?? "—"}</TableCell>
                  <TableCell>
                    <Chip label={a.status} size="small" color={statusColor(a.status)} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Medical Record Dialog */}
      <MedicalRecordDialog
        open={recordDialogOpen}
        patientId={id}
        onClose={() => setRecordDialogOpen(false)}
        onCreated={() => {
          setRecordDialogOpen(false);
          loadData();
        }}
      />

      {/* Booking Dialog */}
      <BookingDialog
        open={bookingDialogOpen}
        preselectedPatientId={id}
        preselectedOwnerId={patient.ownerId}
        onClose={() => setBookingDialogOpen(false)}
        onBooked={() => {
          setBookingDialogOpen(false);
          loadData();
        }}
      />
    </Box>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <Typography variant="body2" sx={{ mb: 0.5 }}>
      <strong>{label}:</strong> {value ?? "—"}
    </Typography>
  );
}
