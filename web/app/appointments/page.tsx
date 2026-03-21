"use client";

import { useMemo, useState } from "react";
import { Container, Typography, Box, TextField, Button, CircularProgress, Alert, List, ListItem, ListItemText } from "@mui/material";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Slot = { start: string; end: string };

export default function AppointmentsPage() {
  const todayStr = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [date, setDate] = useState<string>(todayStr);
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadSlots(d: string) {
    setError(null);
    setLoading(true);
    setSlots(null);
    try {
      const url = new URL(`${API_BASE}/appointments/slots`);
      url.searchParams.set("date", d);
      const res = await fetch(url.toString(), { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as Slot[];
      setSlots(data);
    } catch (e: any) {
      setError(e.message ?? "Failed to load slots");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Appointments (read‑only)
      </Typography>

      <Box sx={{ display: "flex", gap: 2, alignItems: "center", mb: 2 }}>
        <TextField
          type="date"
          label="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          inputProps={{ "aria-label": "Select date" }}
        />
        <Button
          variant="contained"
          onClick={() => loadSlots(date)}
          disabled={loading}
          sx={{ '&:focus-visible': { outline: '3px solid rgba(25, 118, 210, 0.6)', outlineOffset: 2 } }}
        >
          {loading ? "Loading…" : "Show slots"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" role="alert" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading && (
        <Box role="status" aria-live="polite" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <CircularProgress size={16} aria-label="Loading slots" />
          <Typography>Loading slots…</Typography>
        </Box>
      )}

      {slots && (
        <Box component="section" aria-labelledby="results-heading" sx={{ mt: 2 }}>
          <Typography id="results-heading" variant="h6" gutterBottom>
            Available slots for {date}
          </Typography>
          {slots.length === 0 ? (
            <Typography>No slots available.</Typography>
          ) : (
            <List aria-label="Available slots">
              {slots.map((s, i) => (
                <ListItem key={`${s.start}-${i}`} divider>
                  <ListItemText primary={`${new Date(s.start).toLocaleTimeString()} – ${new Date(s.end).toLocaleTimeString()}`} />
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}
    </Container>
  );
}
