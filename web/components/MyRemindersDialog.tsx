"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  TextField,
  MenuItem,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Tabs,
  Tab,
  Badge,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WarningIcon from "@mui/icons-material/Warning";
import SmsIcon from "@mui/icons-material/Sms";
import { apiJson, AuthError } from "../lib/api";
import { useToast } from "./ToastProvider";
import SMSSendDialog from "./SMSSendDialog";

interface Reminder {
  id: string;
  type: string;
  title: string;
  description: string | null;
  dueDate: string;
  status: string;
  priority: string;
  patient: {
    id: string;
    name: string;
    species: string;
    owner: {
      name: string;
      phone: string;
    };
  } | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
}

type TabValue = "today" | "upcoming" | "overdue" | "all";

const TYPE_LABELS: Record<string, string> = {
  lab_results: "Lab Results",
  recheck: "Recheck",
  surgery_followup: "Surgery Follow-up",
  medication: "Medication",
  custom: "Custom",
};

const TYPE_COLORS: Record<string, "default" | "primary" | "secondary" | "info" | "success"> = {
  lab_results: "info",
  recheck: "primary",
  surgery_followup: "secondary",
  medication: "success",
  custom: "default",
};

export default function MyRemindersDialog({ open, onClose }: Props) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<TabValue>("today");
  const [reminders, setReminders] = useState<{
    today: Reminder[];
    upcoming: Reminder[];
    overdue: Reminder[];
    all: Reminder[];
  }>({ today: [], upcoming: [], overdue: [], all: [] });
  const [stats, setStats] = useState({
    totalPending: 0,
    overdue: 0,
    dueToday: 0,
    highPriority: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReminders = async () => {
    setLoading(true);
    setError(null);
    try {
      const [remindersRes, statsRes] = await Promise.all([
        apiJson<{ today: Reminder[]; upcoming: Reminder[]; overdue: Reminder[]; all: Reminder[] }>("/v1/reminders/my-reminders"),
        apiJson<typeof stats>("/v1/reminders/stats"),
      ]);
      setReminders(remindersRes);
      setStats(statsRes);
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      setError(e instanceof Error ? e.message : "Failed to load reminders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadReminders();
    }
  }, [open]);

  const handleComplete = async (id: string) => {
    try {
      await apiJson(`/v1/reminders/${id}/complete`, { method: "POST" });
      toast.success("Reminder completed");
      loadReminders();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      toast.error(e instanceof Error ? e.message : "Failed to complete reminder");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reminder?")) return;

    try {
      await apiJson(`/v1/reminders/${id}`, { method: "DELETE" });
      toast.success("Reminder deleted");
      loadReminders();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      toast.error(e instanceof Error ? e.message : "Failed to delete reminder");
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "error";
      case "high":
        return "warning";
      case "low":
        return "default";
      default:
        return "info";
    }
  };

  const currentReminders = reminders[activeTab] || [];
  const [selectedReminder, setSelectedReminder] = useState<Reminder | null>(null);
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);

  const handleOpenSMSDialog = (reminder: Reminder) => {
    setSelectedReminder(reminder);
    setSmsDialogOpen(true);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          My Reminders
          <Box sx={{ display: "flex", gap: 1 }}>
            {stats.overdue > 0 && (
              <Chip
                icon={<WarningIcon />}
                label={`${stats.overdue} Overdue`}
                color="error"
                size="small"
              />
            )}
            {stats.dueToday > 0 && (
              <Chip
                icon={<AccessTimeIcon />}
                label={`${stats.dueToday} Due Today`}
                color="primary"
                size="small"
              />
            )}
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ mb: 2 }}
        >
          <Tab
            label={
              <Badge badgeContent={reminders.today.length} color="primary">
                Today
              </Badge>
            }
            value="today"
          />
          <Tab
            label={
              <Badge badgeContent={reminders.upcoming.length} color="info">
                Upcoming
              </Badge>
            }
            value="upcoming"
          />
          <Tab
            label={
              <Badge badgeContent={reminders.overdue.length} color="error">
                Overdue
              </Badge>
            }
            value="overdue"
          />
          <Tab label="All" value="all" />
        </Tabs>

        {loading ? (
          <Typography color="text.secondary">Loading...</Typography>
        ) : currentReminders.length === 0 ? (
          <Alert severity="info">
            No {activeTab === "all" ? "" : activeTab} reminders
          </Alert>
        ) : (
          <List>
            {currentReminders.map((reminder, index) => (
              <Box key={reminder.id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" component="span">
                          {reminder.title}
                        </Typography>
                        <Chip
                          label={TYPE_LABELS[reminder.type] || reminder.type}
                          size="small"
                          color={TYPE_COLORS[reminder.type] || "default"}
                        />
                        <Chip
                          label={reminder.priority}
                          size="small"
                          color={getPriorityColor(reminder.priority) as any}
                          variant="outlined"
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        {reminder.patient && (
                          <Typography variant="body2" component="span" display="block">
                            {reminder.patient.name} ({reminder.patient.species}) • {" "}
                            {reminder.patient.owner.name}
                          </Typography>
                        )}
                        {reminder.description && (
                          <Typography variant="body2" color="text.secondary" display="block">
                            {reminder.description}
                          </Typography>
                        )}
                        <Typography variant="caption" color="text.secondary">
                          Due: {new Date(reminder.dueDate).toLocaleDateString()} at{" "}
                          {new Date(reminder.dueDate).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Typography>
                      </>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => handleOpenSMSDialog(reminder)}
                      title="Send SMS"
                      disabled={!reminder.patient?.owner?.phone}
                    >
                      <SmsIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="success"
                      onClick={() => handleComplete(reminder.id)}
                      title="Mark complete"
                    >
                      <CheckCircleIcon />
                    </IconButton>
                    <IconButton
                      edge="end"
                      color="error"
                      onClick={() => handleDelete(reminder.id)}
                      title="Delete"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </Box>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>

    <SMSSendDialog
      open={smsDialogOpen}
      onClose={() => setSmsDialogOpen(false)}
      reminder={selectedReminder || undefined}
    />
    </>
  );
}
