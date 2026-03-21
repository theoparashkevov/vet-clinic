"use client";

import { useEffect, useMemo, useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Health = { ok?: boolean; status?: string } | null;

type SlotsResponse = {
  date: string;
  slots: string[];
};

export default function HomePage() {
  const [health, setHealth] = useState<Health>(null);
  const [date, setDate] = useState<string>(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<string[]>([]);

  // Health check
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      try {
        const res = await fetch(`${API_BASE}/health`);
        const data = await res.json();
        if (mounted) setHealth(data);
      } catch (e) {
        if (mounted) setHealth(null);
      }
    };
    run();
    const id = setInterval(run, 15000);
    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const healthUi = useMemo(() => {
    if (!health) return <Alert severity="error" aria-live="polite">API unreachable</Alert>;
    const ok = Boolean((health as any).ok || (health as any).status === "ok");
    return ok ? (
      <Alert severity="success" aria-live="polite">API healthy</Alert>
    ) : (
      <Alert severity="warning" aria-live="polite">API degraded</Alert>
    );
  }, [health]);

  const onShowSlots = async () => {
    setError(null);
    setLoading(true);
    setSlots([]);
    try {
      const res = await fetch(`${API_BASE}/appointments/slots?date=${date}`);
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      const data: SlotsResponse = await res.json();
      setSlots(data.slots || []);
    } catch (e: any) {
      setError(e.message || "Failed to load slots");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Vet Clinic — POC
      </Typography>

      <Box sx={{ mb: 2 }}>{healthUi}</Box>

      <Box component="form" onSubmit={(e) => { e.preventDefault(); onShowSlots(); }}
           aria-label="Choose date and show available slots"
           sx={{ display: "flex", gap: 2, alignItems: "center", mb: 3 }}>
        <TextField
          type="date"
          label="Date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          aria-label="Select date"
        />
        <Button
          type="submit"
          variant="contained"
          disabled={loading}
          aria-label="Show slots"
          sx={{
            '&:focus-visible': {
              outline: '3px solid rgba(25, 118, 210, 0.6)',
              outlineOffset: 2,
            },
          }}
        >
          {loading ? <><CircularProgress size={18} sx={{ mr: 1 }} /> Loading…</> : "Show slots"}
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} role="alert" aria-live="assertive">
          {error}
        </Alert>
      )}

      <Box aria-live="polite" aria-busy={loading ? "true" : "false"}>
        {slots.length > 0 ? (
          <Box component="ul" sx={{ pl: 3 }}>
            {slots.map((s) => (
              <li key={s}><code>{s}</code></li>
            ))}
          </Box>
        ) : !loading ? (
          <Typography color="text.secondary">No slots to show.</Typography>
        ) : null}
      </Box>
    </Container>
  );
}
