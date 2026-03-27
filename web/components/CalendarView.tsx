"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import TodayIcon from "@mui/icons-material/Today";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

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

type ViewMode = "day" | "week";

type Props = {
  appointments: Appointment[];
  selectedDate: string;
  onDateChange: (date: string) => void;
  onAppointmentClick: (appointment: Appointment) => void;
  doctorFilter?: string;
};

const CLINIC_HOURS = { start: 9, end: 18 }; // 9 AM to 6 PM
const SLOT_HEIGHT = 60; // pixels per hour

function statusColor(s: string): "default" | "success" | "warning" | "error" {
  if (s === "completed") return "success";
  if (s === "cancelled") return "error";
  return "default";
}

function formatTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getDurationMinutes(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60);
}

function getWeekDays(dateStr: string): Date[] {
  const date = new Date(dateStr);
  const day = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust to get Monday
  const monday = new Date(date.setDate(diff));
  
  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export default function CalendarView({
  appointments,
  selectedDate,
  onDateChange,
  onAppointmentClick,
  doctorFilter,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("day");

  const filteredAppointments = doctorFilter
    ? appointments.filter((a) => a.doctor?.id === doctorFilter)
    : appointments;

  const handlePrevious = () => {
    const date = new Date(selectedDate);
    if (viewMode === "day") {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() - 7);
    }
    onDateChange(date.toISOString().slice(0, 10));
  };

  const handleNext = () => {
    const date = new Date(selectedDate);
    if (viewMode === "day") {
      date.setDate(date.getDate() + 1);
    } else {
      date.setDate(date.getDate() + 7);
    }
    onDateChange(date.toISOString().slice(0, 10));
  };

  const handleToday = () => {
    onDateChange(new Date().toISOString().slice(0, 10));
  };

  const renderTimeColumn = () => (
    <Box sx={{ width: 60, flexShrink: 0, pt: `${SLOT_HEIGHT}px` }}>
      {Array.from({ length: CLINIC_HOURS.end - CLINIC_HOURS.start }, (_, i) => {
        const hour = CLINIC_HOURS.start + i;
        return (
          <Box
            key={hour}
            sx={{
              height: SLOT_HEIGHT,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              pt: 0.5,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {hour}:00
            </Typography>
          </Box>
        );
      })}
    </Box>
  );

  const renderAppointmentCard = (appt: Appointment, dayStart: Date) => {
    const startTime = new Date(appt.startsAt);
    const endTime = new Date(appt.endsAt);
    const dayStartTime = new Date(dayStart);
    dayStartTime.setHours(CLINIC_HOURS.start, 0, 0, 0);

    const startMinutesFromDayStart = (startTime.getTime() - dayStartTime.getTime()) / (1000 * 60);
    const durationMinutes = getDurationMinutes(appt.startsAt, appt.endsAt);

    // Only show if within clinic hours
    if (startMinutesFromDayStart < 0 || startMinutesFromDayStart >= (CLINIC_HOURS.end - CLINIC_HOURS.start) * 60) {
      return null;
    }

    const top = (startMinutesFromDayStart / 60) * SLOT_HEIGHT;
    const height = (durationMinutes / 60) * SLOT_HEIGHT;

    return (
      <Paper
        key={appt.id}
        elevation={1}
        onClick={() => onAppointmentClick(appt)}
        sx={{
          position: "absolute",
          left: 4,
          right: 4,
          top: `${top}px`,
          height: `${Math.max(height - 4, 24)}px`,
          p: 0.75,
          cursor: "pointer",
          overflow: "hidden",
          borderLeft: 3,
          borderColor: `${statusColor(appt.status)}.main`,
          bgcolor: "background.paper",
          transition: "box-shadow 0.2s",
          "&:hover": {
            boxShadow: 3,
            zIndex: 1,
          },
        }}
      >
        <Typography variant="caption" fontWeight={600} noWrap display="block">
          {formatTime(appt.startsAt)} - {appt.patient.name}
        </Typography>
        <Typography variant="caption" color="text.secondary" noWrap display="block">
          {appt.doctor?.name ?? "No doctor"}
        </Typography>
        <Box sx={{ mt: 0.5 }}>
          <Chip
            label={appt.status}
            size="small"
            color={statusColor(appt.status)}
            sx={{ fontSize: "0.6rem", height: 18 }}
          />
        </Box>
      </Paper>
    );
  };

  const renderDayColumn = (date: Date, dayAppointments: Appointment[]) => {
    const isToday = formatDateKey(date) === new Date().toISOString().slice(0, 10);
    const isSelected = formatDateKey(date) === selectedDate;

    return (
      <Box
        key={date.toISOString()}
        sx={{
          flex: 1,
          minWidth: 200,
          borderRight: "1px solid",
          borderColor: "divider",
          bgcolor: isSelected ? "action.hover" : "background.default",
        }}
      >
        {/* Header */}
        <Box
          sx={{
            p: 1,
            textAlign: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: isToday ? "primary.main" : "background.paper",
            color: isToday ? "primary.contrastText" : "text.primary",
          }}
        >
          <Typography variant="caption" display="block" textTransform="uppercase">
            {date.toLocaleDateString("en-US", { weekday: "short" })}
          </Typography>
          <Typography variant="h6" fontWeight={600}>
            {date.getDate()}
          </Typography>
        </Box>

        {/* Time slots */}
        <Box sx={{ position: "relative", height: (CLINIC_HOURS.end - CLINIC_HOURS.start) * SLOT_HEIGHT }}>
          {/* Grid lines */}
          {Array.from({ length: CLINIC_HOURS.end - CLINIC_HOURS.start }, (_, i) => (
            <Box
              key={i}
              sx={{
                height: SLOT_HEIGHT,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            />
          ))}

          {/* Appointments */}
          {dayAppointments.map((appt) => renderAppointmentCard(appt, date))}
        </Box>
      </Box>
    );
  };

  const weekDays = getWeekDays(selectedDate);

  return (
    <Box>
      {/* Toolbar */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <IconButton onClick={handlePrevious} size="small">
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={handleNext} size="small">
          <ChevronRightIcon />
        </IconButton>
        <Button startIcon={<TodayIcon />} onClick={handleToday} size="small">
          Today
        </Button>
        <Box sx={{ flex: 1 }} />
        <ToggleButtonGroup
          value={viewMode}
          exclusive
          onChange={(_, value) => value && setViewMode(value)}
          size="small"
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Calendar */}
      <Paper elevation={1} sx={{ display: "flex", overflow: "auto" }}>
        {renderTimeColumn()}
        {viewMode === "day" ? (
          renderDayColumn(
            new Date(selectedDate),
            filteredAppointments.filter(
              (a) => new Date(a.startsAt).toISOString().slice(0, 10) === selectedDate
            )
          )
        ) : (
          weekDays.map((day) => {
            const dateKey = formatDateKey(day);
            const dayAppointments = filteredAppointments.filter(
              (a) => new Date(a.startsAt).toISOString().slice(0, 10) === dateKey
            );
            return renderDayColumn(day, dayAppointments);
          })
        )}
      </Paper>
    </Box>
  );
}
