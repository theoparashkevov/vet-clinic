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
import PatientTimeline from "../../../components/PatientTimeline";
import PatientAlertBanner from "../../../components/PatientAlertBanner";
import VaccinationStatus from "../../../components/VaccinationStatus";
import VaccinationDialog from "../../../components/VaccinationDialog";
import WeightRecordDialog from "../../../components/WeightRecordDialog";
import WeightHistoryChart from "../../../components/WeightHistoryChart";
import PageHeader from "../../../components/PageHeader";
import InlineLoading from "../../../components/InlineLoading";
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

type VaccinationStatusType = {
  status: "current" | "due-soon" | "overdue";
  summary: {
    current: number;
    dueSoon: number;
    overdue: number;
    total: number;
  };
  vaccinations: Array<{
    id: string;
    name: string;
    dueDate: string;
    status: "current" | "due-soon" | "overdue";
  }>;
};

type PatientAlert = {
  id: string;
  type: "allergy" | "chronic_condition" | "medication" | "behavioral" | "other";
  severity: "critical" | "warning" | "info";
  description: string;
};

type WeightRecord = {
  id: string;
  weight: number;
  date: string;
  notes?: string;
};

type WeightSummary = {
  current: number | null;
  previous: number | null;
  trend: {
    direction: "up" | "down" | "stable";
    percentage: number;
    message: string;
  } | null;
  records: WeightRecord[];
};

function statusColor(s: string): "default" | "success" | "warning" | "error" | "primary" {
  if (s === "completed") return "success";
  if (s === "cancelled") return "error";
  if (s === "in-progress") return "primary";
  return "default";
}

export default function PatientDetailPage() {
  const params = useParams();
  const id = params.id as string;


  const [patient, setPatient] = useState<Patient | null>(null);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vaccinationStatus, setVaccinationStatus] = useState<VaccinationStatusType | null>(null);
  const [patientAlerts, setPatientAlerts] = useState<PatientAlert[]>([]);
  const [weightSummary, setWeightSummary] = useState<WeightSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recordDialogOpen, setRecordDialogOpen] = useState(false);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  const [vaccinationDialogOpen, setVaccinationDialogOpen] = useState(false);
  const [weightDialogOpen, setWeightDialogOpen] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [pat, recs, patApptsRes, vacStatus, alerts, weight] = await Promise.all([
        apiJson<Patient>(`/v1/patients/${id}`),
        apiJson<MedicalRecord[]>(`/v1/patients/${id}/medical-records`),
        apiJson<{ data: Appointment[]; meta: any }>(`/v1/appointments?patientId=${encodeURIComponent(id)}`),
        apiJson<VaccinationStatusType>(`/v1/vaccinations/patients/${id}/status`).catch(() => null),
        apiJson<PatientAlert[]>(`/v1/patients/${id}/alerts`).catch(() => []),
        apiJson<WeightSummary>(`/v1/weight/patients/${id}/summary`).catch(() => null),
      ]);
      setPatient(pat);
      setRecords(recs);
      setAppointments(patApptsRes.data);
      setVaccinationStatus(vacStatus);
      setPatientAlerts(alerts);
      setWeightSummary(weight);
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

      {/* Patient Alert Banner */}
      {patientAlerts.length > 0 && (
        <Box sx={{ mb: 3 }}>
          <PatientAlertBanner alerts={patientAlerts} />
        </Box>
      )}

      {/* Vaccination Status Banner */}
      {vaccinationStatus && vaccinationStatus.summary.total > 0 && (
        <Box sx={{ mb: 3 }}>
          <VaccinationStatus
            status={{
              status: vaccinationStatus.status,
              vaccinations: vaccinationStatus.vaccinations.map(v => ({
                id: v.id,
                name: v.name,
                dueDate: v.dueDate,
              })),
            }}
          />
        </Box>
      )}

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

      {/* Vaccinations Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5">Vaccinations</Typography>
          <Button variant="outlined" size="small" onClick={() => setVaccinationDialogOpen(true)}>
            Add Vaccination
          </Button>
        </Box>
        
        {vaccinationStatus && vaccinationStatus.summary.total > 0 ? (
          <Paper>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Vaccine</TableCell>
                    <TableCell>Administered</TableCell>
                    <TableCell>Due Date</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {vaccinationStatus.vaccinations.map((vac) => (
                    <TableRow key={vac.id}>
                      <TableCell>{vac.name}</TableCell>
                      <TableCell>
                        {vaccinationStatus.vaccinations.find(v => v.id === vac.id)?.dueDate 
                          ? new Date(vaccinationStatus.vaccinations.find(v => v.id === vac.id)!.dueDate).toLocaleDateString()
                          : "—"}
                      </TableCell>
                      <TableCell>{new Date(vac.dueDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={vac.status === "current" ? "Current" : vac.status === "due-soon" ? "Due Soon" : "Overdue"}
                          color={vac.status === "current" ? "success" : vac.status === "due-soon" ? "warning" : "error"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary" gutterBottom>
              No vaccination records yet
            </Typography>
            <Button variant="contained" size="small" onClick={() => setVaccinationDialogOpen(true)}>
              Add First Vaccination
            </Button>
          </Paper>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Weight History Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h5">Weight History</Typography>
          <Button variant="outlined" size="small" onClick={() => setWeightDialogOpen(true)}>
            Record Weight
          </Button>
        </Box>
        
        {weightSummary && weightSummary.records.length > 0 ? (
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", gap: 3, mb: 3, flexWrap: "wrap" }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Current Weight
                </Typography>
                <Typography variant="h4" fontWeight={500}>
                  {weightSummary.current?.toFixed(1) ?? "—"} kg
                </Typography>
              </Box>
              
              {weightSummary.trend && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Trend
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      size="small"
                      label={weightSummary.trend.direction === "stable" ? "Stable" : weightSummary.trend.direction === "up" ? "↑ Gaining" : "↓ Losing"}
                      color={weightSummary.trend.direction === "stable" ? "success" : weightSummary.trend.direction === "up" ? "warning" : "info"}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {weightSummary.trend.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {weightSummary.trend.message}
                  </Typography>
                </Box>
              )}
            </Box>

            <WeightHistoryChart records={weightSummary.records} />

            <TableContainer sx={{ mt: 3 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Weight (kg)</TableCell>
                    <TableCell>Change</TableCell>
                    <TableCell>Notes</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {weightSummary.records.slice(0, 5).map((record, index) => {
                    const prevWeight = index < weightSummary.records.length - 1 ? weightSummary.records[index + 1].weight : null;
                    const change = prevWeight !== null ? record.weight - prevWeight : null;
                    return (
                      <TableRow key={record.id}>
                        <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.weight.toFixed(1)}</TableCell>
                        <TableCell>
                          {change !== null ? (
                            <Typography
                              variant="body2"
                              color={change > 0 ? "success.main" : change < 0 ? "error.main" : "text.secondary"}
                            >
                              {change > 0 ? "+" : ""}{change.toFixed(1)} kg
                            </Typography>
                          ) : (
                            "—"
                          )}
                        </TableCell>
                        <TableCell>{record.notes ?? "—"}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        ) : (
          <Paper sx={{ p: 3, textAlign: "center" }}>
            <Typography color="text.secondary" gutterBottom>
              No weight records yet
            </Typography>
            <Button variant="contained" size="small" onClick={() => setWeightDialogOpen(true)}>
              Record First Weight
            </Button>
          </Paper>
        )}
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Patient Timeline */}
      <Typography variant="h5" gutterBottom>
        History & Timeline
      </Typography>
      <PatientTimeline
        records={records}
        appointments={appointments}
        onAddRecord={() => setRecordDialogOpen(true)}
        onBookAppointment={() => setBookingDialogOpen(true)}
      />

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

      {/* Vaccination Dialog */}
      <VaccinationDialog
        open={vaccinationDialogOpen}
        patientId={id}
        onClose={() => setVaccinationDialogOpen(false)}
        onCreated={() => {
          setVaccinationDialogOpen(false);
          loadData();
        }}
      />
      {/* Weight Record Dialog */}
      <WeightRecordDialog
        open={weightDialogOpen}
        patientId={id}
        onClose={() => setWeightDialogOpen(false)}
        onCreated={() => {
          setWeightDialogOpen(false);
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
