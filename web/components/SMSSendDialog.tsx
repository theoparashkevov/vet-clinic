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
  Chip,
  TextField,
  CircularProgress,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import { apiJson } from "../lib/api";
import { useToast } from "./ToastProvider";

interface SMSStatus {
  enabled: boolean;
  provider: string;
  fromNumber: string | null;
}

interface Reminder {
  id: string;
  title: string;
  type: string;
  patient: {
    name: string;
    owner: {
      name: string;
      phone: string;
    };
  } | null;
}

interface Props {
  open: boolean;
  onClose: () => void;
  reminder?: Reminder;
  appointmentId?: string;
}

export default function SMSSendDialog({ open, onClose, reminder, appointmentId }: Props) {
  const toast = useToast();
  const [status, setStatus] = useState<SMSStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; error?: string } | null>(null);
  const [testPhone, setTestPhone] = useState("");

  useEffect(() => {
    if (open) {
      loadStatus();
    }
  }, [open]);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const res = await apiJson<SMSStatus>("/v1/sms/status");
      setStatus(res);
    } catch (e) {
      console.error("Failed to load SMS status:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    setSending(true);
    setResult(null);

    try {
      if (reminder) {
        const res = await apiJson<{ success: boolean }>(`/v1/sms/send-reminder/${reminder.id}`, {
          method: "POST",
        });
        setResult(res);
        if (res.success) {
          toast.success("SMS sent successfully!");
        } else {
          toast.error("Failed to send SMS");
        }
      } else if (appointmentId) {
        const res = await apiJson<{ success: boolean }>(`/v1/sms/send-appointment-confirmation/${appointmentId}`, {
          method: "POST",
        });
        setResult(res);
        if (res.success) {
          toast.success("SMS sent successfully!");
        }
      }
    } catch (e: any) {
      setResult({ success: false, error: e.message });
      toast.error(e.message || "Failed to send SMS");
    } finally {
      setSending(false);
    }
  };

  const handleTestSMS = async () => {
    if (!testPhone) return;
    
    // In a real implementation, this would send a test SMS
    toast.push({ message: "SMS test would be sent to: " + testPhone, severity: "info" });
  };

  const isConsoleMode = status?.provider === "console";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Send SMS Notification</DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* SMS Status */}
            <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                SMS Provider Status
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
                <Chip
                  label={status?.enabled ? "Enabled" : "Console Mode"}
                  color={status?.enabled ? "success" : "warning"}
                  size="small"
                />
                <Typography variant="body2" color="text.secondary">
                  {status?.provider === "twilio" ? "Twilio" : "Console (Test Mode)"}
                </Typography>
              </Box>
              {isConsoleMode && (
                <Alert severity="info" sx={{ mt: 1 }}>
                  SMS is in test mode. Messages will be logged to the console instead of being sent.
                  <br />
                  To enable real SMS, add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to your .env file.
                </Alert>
              )}
            </Paper>

            {/* Recipient Info */}
            {reminder && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recipient
                </Typography>
                {reminder.patient ? (
                  <>
                    <Typography variant="body1">
                      {reminder.patient.owner.name} ({reminder.patient.name}&apos;s owner)
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {reminder.patient.owner.phone}
                    </Typography>
                  </>
                ) : (
                  <Typography color="error">No patient/owner information</Typography>
                )}
              </Box>
            )}

            {/* Message Preview */}
            {reminder && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Message Preview
                </Typography>
                <Paper variant="outlined" sx={{ p: 2, bgcolor: "grey.50" }}>
                  <Typography variant="body2" sx={{ fontStyle: "italic" }}>
                    Hi {reminder.patient?.owner.name}, {reminder.title} for {reminder.patient?.name}. 
                    Please call {process.env.CLINIC_PHONE || "(555) 123-4567"}. 
                    {process.env.CLINIC_NAME || "Vet Clinic"}
                  </Typography>
                </Paper>
              </Box>
            )}

            {/* Test Mode */}
            {isConsoleMode && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Test Phone Number
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    placeholder="+1234567890"
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    size="small"
                    fullWidth
                  />
                  <Button
                    variant="outlined"
                    onClick={handleTestSMS}
                    disabled={!testPhone}
                  >
                    Test
                  </Button>
                </Box>
              </Box>
            )}

            {/* Result */}
            {result && (
              <Alert
                severity={result.success ? "success" : "error"}
                icon={result.success ? <CheckCircleIcon /> : <ErrorIcon />}
                sx={{ mt: 2 }}
              >
                {result.success
                  ? "SMS sent successfully!"
                  : result.error || "Failed to send SMS"}
              </Alert>
            )}
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {(reminder || appointmentId) && (
          <Button
            variant="contained"
            startIcon={<SendIcon />}
            onClick={handleSend}
            disabled={sending || loading || !status}
          >
            {sending ? "Sending..." : "Send SMS"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
