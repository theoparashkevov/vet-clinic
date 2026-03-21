"use client";

import { useEffect, useState } from "react";
import { Container, Typography, Alert, CircularProgress, List, ListItem, ListItemText } from "@mui/material";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type Patient = {
  id: string | number;
  name: string;
  ownerId?: string | number;
  species?: string | null;
  breed?: string | null;
};

type PatientsResp = Patient[];

export default function PatientsPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [patients, setPatients] = useState<PatientsResp | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/v1/patients`, { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = (await res.json()) as PatientsResp;
        if (!cancelled) setPatients(data);
      } catch (e: any) {
        if (!cancelled) setError(e.message ?? "Failed to load patients");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography component="h1" variant="h4" gutterBottom>
        Patients (read‑only)
      </Typography>

      {loading && (
        <div role="status" aria-live="polite" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CircularProgress size={16} aria-label="Loading patients" />
          <Typography>Loading…</Typography>
        </div>
      )}

      {error && (
        <Alert severity="info" role="alert" sx={{ mt: 2 }}>
          {error.includes("404")
            ? "Patients endpoint not available yet. It will appear once the backend PR merges."
            : error}
        </Alert>
      )}

      {patients && (
        patients.length === 0 ? (
          <Typography sx={{ mt: 2 }}>No patients yet.</Typography>
        ) : (
          <List aria-label="Patients list" sx={{ mt: 2 }}>
            {patients.map((p) => (
              <ListItem key={String(p.id)} divider>
                <ListItemText
                  primary={p.name}
                  secondary={[p.species, p.breed].filter(Boolean).join(" • ") || undefined}
                />
              </ListItem>
            ))}
          </List>
        )
      )}
    </Container>
  );
}
