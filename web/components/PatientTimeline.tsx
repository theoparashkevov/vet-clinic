"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import EmptyState from "./EmptyState";

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

type TimelineEvent =
  | { type: "record"; data: MedicalRecord; date: Date }
  | { type: "appointment"; data: Appointment; date: Date };

type Props = {
  records: MedicalRecord[];
  appointments: Appointment[];
  onAddRecord: () => void;
  onBookAppointment: () => void;
};

function statusColor(s: string): "default" | "success" | "warning" | "error" {
  if (s === "completed") return "success";
  if (s === "cancelled" || s === "no-show") return "error";
  return "default";
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PatientTimeline({
  records,
  appointments,
  onAddRecord,
  onBookAppointment,
}: Props) {
  const [filter, setFilter] = useState<"all" | "records" | "appointments">("all");
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);

  // Combine and sort events by date (newest first)
  const allEvents: TimelineEvent[] = [
    ...records.map((r): TimelineEvent => ({ type: "record", data: r, date: new Date(r.visitDate) })),
    ...appointments.map((a): TimelineEvent => ({ type: "appointment", data: a, date: new Date(a.startsAt) })),
  ];

  const events = allEvents
    .filter((e) => {
      if (filter === "all") return true;
      return e.type === (filter === "records" ? "record" : "appointment");
    })
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (events.length === 0) {
    return (
      <EmptyState
        title="No history yet"
        description="Start building the patient timeline by adding appointments and medical records."
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={onAddRecord}>
              Add Record
            </Button>
            <Button variant="contained" onClick={onBookAppointment}>
              Book Appointment
            </Button>
          </Box>
        }
      />
    );
  }

  return (
    <Box>
      {/* Filter */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 2 }}>
        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, value) => value && setFilter(value)}
          size="small"
        >
          <ToggleButton value="all">All</ToggleButton>
          <ToggleButton value="records">Records</ToggleButton>
          <ToggleButton value="appointments">Appointments</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Timeline position="alternate">
        {events.map((event, index) => (
          <TimelineItem key={`${event.type}-${getId(event)}`}>
            <TimelineSeparator>
              <TimelineDot color={event.type === "record" ? "primary" : "secondary"}>
                {event.type === "record" ? <MedicalServicesIcon /> : <CalendarTodayIcon />}
              </TimelineDot>
              {index < events.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              {event.type === "record" ? (
                <RecordCard
                  record={event.data}
                  expanded={expandedRecord === event.data.id}
                  onToggle={() =>
                    setExpandedRecord(expandedRecord === event.data.id ? null : event.data.id)
                  }
                />
              ) : (
                <AppointmentCard appointment={event.data} />
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Box>
  );
}

function getId(event: TimelineEvent): string {
  return event.type === "record" ? event.data.id : event.data.id;
}

function RecordCard({
  record,
  expanded,
  onToggle,
}: {
  record: MedicalRecord;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <Paper elevation={2} sx={{ p: 2, textAlign: "left" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Typography variant="subtitle2" color="primary">
          Medical Record
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatDate(record.visitDate)}
        </Typography>
      </Box>

      <Typography variant="body1" sx={{ mb: 1 }}>
        {record.summary}
      </Typography>

      {(record.diagnoses || record.treatments || record.prescriptions) && (
        <Button size="small" onClick={onToggle} sx={{ mb: 1 }}>
          {expanded ? "Show Less" : "Show Details"}
        </Button>
      )}

      {expanded && (
        <Box sx={{ mt: 1 }}>
          {record.diagnoses && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <strong>Diagnoses:</strong> {record.diagnoses}
            </Typography>
          )}
          {record.treatments && (
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              <strong>Treatments:</strong> {record.treatments}
            </Typography>
          )}
          {record.prescriptions && (
            <Typography variant="body2" color="text.secondary">
              <strong>Prescriptions:</strong> {record.prescriptions}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  return (
    <Paper elevation={2} sx={{ p: 2, textAlign: "left" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Typography variant="subtitle2" color="secondary">
          Appointment
        </Typography>
        <Chip
          label={appointment.status}
          size="small"
          color={statusColor(appointment.status)}
        />
      </Box>

      <Typography variant="h6" sx={{ mb: 0.5 }}>
        {formatDate(appointment.startsAt)}
      </Typography>

      <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
        {formatTime(appointment.startsAt)} - {formatTime(appointment.endsAt)}
      </Typography>

      {appointment.reason && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          <strong>Reason:</strong> {appointment.reason}
        </Typography>
      )}

      {appointment.doctor && (
        <Typography variant="body2" color="text.secondary">
          <strong>Doctor:</strong> {appointment.doctor.name}
        </Typography>
      )}
    </Paper>
  );
}
