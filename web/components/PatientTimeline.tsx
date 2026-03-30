"use client";

import { useState, useMemo } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
import Collapse from "@mui/material/Collapse";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import DateRangeIcon from "@mui/icons-material/DateRange";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import EmptyState from "./EmptyState";
import { FadeIn } from "./animations";

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

type PeriodFilter = "all" | "month" | "3months" | "6months" | "year" | "custom";

type Props = {
  records: MedicalRecord[];
  appointments: Appointment[];
  onAddRecord: () => void;
  onBookAppointment: () => void;
};

const PERIOD_OPTIONS = [
  { value: "all", label: "All Time" },
  { value: "month", label: "Last Month" },
  { value: "3months", label: "Last 3 Months" },
  { value: "6months", label: "Last 6 Months" },
  { value: "year", label: "Last Year" },
  { value: "custom", label: "Custom Range" },
];

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

function getPeriodStartDate(period: PeriodFilter): Date {
  const now = new Date();
  switch (period) {
    case "month":
      return new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    case "3months":
      return new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
    case "6months":
      return new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    case "year":
      return new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
    default:
      return new Date(0); // All time
  }
}

export default function PatientTimeline({
  records,
  appointments,
  onAddRecord,
  onBookAppointment,
}: Props) {
  const [typeFilter, setTypeFilter] = useState<"all" | "records" | "appointments">("all");
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [expandedRecord, setExpandedRecord] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Combine and create events
  const allEvents: TimelineEvent[] = useMemo(() => {
    const recordEvents: TimelineEvent[] = records.map((r) => ({
      type: "record" as const,
      data: r,
      date: new Date(r.visitDate),
    }));
    const appointmentEvents: TimelineEvent[] = appointments.map((a) => ({
      type: "appointment" as const,
      data: a,
      date: new Date(a.startsAt),
    }));
    return [...recordEvents, ...appointmentEvents];
  }, [records, appointments]);

  // Filter events
  const filteredEvents = useMemo(() => {
    let events = [...allEvents];

    // Type filter
    if (typeFilter !== "all") {
      events = events.filter((e) =>
        typeFilter === "records" ? e.type === "record" : e.type === "appointment"
      );
    }

    // Period filter
    if (periodFilter !== "all" && periodFilter !== "custom") {
      const startDate = getPeriodStartDate(periodFilter);
      events = events.filter((e) => e.date >= startDate);
    } else if (periodFilter === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999); // Include the full end day
      events = events.filter((e) => e.date >= start && e.date <= end);
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      events = events.filter((e) => {
        if (e.type === "record") {
          const record = e.data;
          return (
            record.summary?.toLowerCase().includes(query) ||
            record.diagnoses?.toLowerCase().includes(query) ||
            record.treatments?.toLowerCase().includes(query) ||
            record.prescriptions?.toLowerCase().includes(query)
          );
        } else {
          const appointment = e.data;
          return (
            appointment.reason?.toLowerCase().includes(query) ||
            appointment.doctor?.name?.toLowerCase().includes(query) ||
            appointment.status?.toLowerCase().includes(query)
          );
        }
      });
    }

    // Sort by date (newest first)
    return events.sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [allEvents, typeFilter, periodFilter, searchQuery, customStartDate, customEndDate]);

  // Group events by month for better organization
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: TimelineEvent[] } = {};
    filteredEvents.forEach((event) => {
      const monthKey = event.date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
      });
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(event);
    });
    return groups;
  }, [filteredEvents]);

  const hasActiveFilters = typeFilter !== "all" || periodFilter !== "all" || searchQuery;

  const clearFilters = () => {
    setTypeFilter("all");
    setPeriodFilter("all");
    setSearchQuery("");
    setCustomStartDate("");
    setCustomEndDate("");
  };

  if (allEvents.length === 0) {
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
      {/* Search Bar */}
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Search medical history..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
            endAdornment: searchQuery && (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearchQuery("")}>
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {/* Filters Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Button
          size="small"
          onClick={() => setShowFilters(!showFilters)}
          startIcon={<DateRangeIcon />}
          endIcon={showFilters ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
        >
          Filters
          {hasActiveFilters && (
            <Chip
              size="small"
              label="Active"
              color="primary"
              sx={{ ml: 1, height: 20, fontSize: "0.7rem" }}
            />
          )}
        </Button>

        {hasActiveFilters && (
          <Button size="small" onClick={clearFilters}>
            Clear Filters
          </Button>
        )}
      </Box>

      {/* Expandable Filters */}
      <Collapse in={showFilters}>
        <Paper sx={{ p: 2, mb: 3 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Period Filter */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                Time Period
              </Typography>
              <TextField
                select
                size="small"
                value={periodFilter}
                onChange={(e) => setPeriodFilter(e.target.value as PeriodFilter)}
                sx={{ minWidth: 180 }}
              >
                {PERIOD_OPTIONS.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Box>

            {/* Custom Date Range */}
            {periodFilter === "custom" && (
              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                <TextField
                  label="From"
                  type="date"
                  size="small"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  label="To"
                  type="date"
                  size="small"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}

            {/* Type Filter */}
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block" }}>
                Event Type
              </Typography>
              <ToggleButtonGroup
                value={typeFilter}
                exclusive
                onChange={(_, value) => value && setTypeFilter(value)}
                size="small"
              >
                <ToggleButton value="all">All</ToggleButton>
                <ToggleButton value="records">Records</ToggleButton>
                <ToggleButton value="appointments">Appointments</ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Paper>
      </Collapse>

      {/* Results Summary */}
      {filteredEvents.length > 0 && (
        <Typography variant="caption" color="text.secondary" sx={{ mb: 2, display: "block" }}>
          Showing {filteredEvents.length} of {allEvents.length} events
          {searchQuery && ` matching "${searchQuery}"`}
        </Typography>
      )}

      {/* Timeline */}
      {filteredEvents.length === 0 ? (
        <EmptyState
          title="No matching events"
          description={
            hasActiveFilters
              ? "Try adjusting your filters or search query."
              : "No events found in this patient's history."
          }
          action={
            hasActiveFilters && (
              <Button variant="outlined" onClick={clearFilters}>
                Clear Filters
              </Button>
            )
          }
        />
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {Object.entries(groupedEvents).map(([month, monthEvents]) => (
            <FadeIn key={month} direction="up" delay={0.1}>
              <Box key={month}>
                {/* Month Header */}
                <Typography
                  variant="subtitle2"
                  sx={{
                    mb: 2,
                    color: "primary.main",
                    fontWeight: 600,
                    borderBottom: "2px solid",
                    borderColor: "primary.main",
                    pb: 0.5,
                    display: "inline-block",
                  }}
                >
                  {month}
                </Typography>

                {/* Events in this month */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {monthEvents.map((event) => (
                    <Box key={`${event.type}-${getId(event)}`} sx={{ display: "flex", gap: 2 }}>
                      {/* Icon and line */}
                      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <Box
                          sx={{
                            width: 40,
                            height: 40,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            bgcolor: event.type === "record" ? "primary.main" : "secondary.main",
                            color: "white",
                          }}
                        >
                          {event.type === "record" ? <MedicalServicesIcon /> : <CalendarTodayIcon />}
                        </Box>
                        <Box sx={{ width: 2, flex: 1, bgcolor: "divider", my: 1 }} />
                      </Box>

                      {/* Content */}
                      <Box sx={{ flex: 1, pb: 3 }}>
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
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            </FadeIn>
          ))}
        </Box>
      )}
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
    <Paper elevation={2} sx={{ p: 2 }}>
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
    <Paper elevation={2} sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Typography variant="subtitle2" color="secondary">
          Appointment
        </Typography>
        <Chip label={appointment.status} size="small" color={statusColor(appointment.status)} />
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
