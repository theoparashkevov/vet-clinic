"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import TableSkeleton from "../../components/TableSkeleton";
import { useToast } from "../../components/ToastProvider";
import { apiJson, AuthError } from "../../lib/api";

type Owner = { id: string; name: string; phone: string; email: string | null };
type Patient = {
  id: string;
  name: string;
  species: string;
  breed: string | null;
  owner: Owner;
};

export default function PatientsPage() {
  const router = useRouter();
  const toast = useToast();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [owners, setOwners] = useState<Owner[]>([]);

  // Form state
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    ownerId: "",
    birthdate: "",
    microchipId: "",
    allergies: "",
    chronicConditions: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const loadPatients = useCallback(async (q?: string) => {
    setLoading(true);
    setLoadError(null);
    try {
      const searchParams = new URLSearchParams();
      if (q) searchParams.set("search", q);
      const suffix = searchParams.toString();
      setPatients(await apiJson<Patient[]>(`/v1/patients${suffix ? `?${suffix}` : ""}`));
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      setLoadError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleSearch = () => {
    loadPatients(search || undefined);
  };

  const openCreateDialog = async () => {
    // Load owners for dropdown
    try {
      setOwners(await apiJson<Owner[]>("/v1/owners"));
    } catch { /* ignore */ }
    setDialogOpen(true);
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const body: Record<string, string> = {
        name: form.name,
        species: form.species,
        ownerId: form.ownerId,
      };
      if (form.breed) body.breed = form.breed;
      if (form.birthdate) body.birthdate = new Date(form.birthdate).toISOString();
      if (form.microchipId) body.microchipId = form.microchipId;
      if (form.allergies) body.allergies = form.allergies;
      if (form.chronicConditions) body.chronicConditions = form.chronicConditions;

      await apiJson<Patient>("/v1/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setDialogOpen(false);
      setForm({ name: "", species: "", breed: "", ownerId: "", birthdate: "", microchipId: "", allergies: "", chronicConditions: "" });
      toast.success("Patient created");
      loadPatients();
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      const message = e instanceof Error ? e.message : "Failed to create patient";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <PageHeader
        title="Patients"
        subtitle="Search, create, and open patient records"
        actions={
          <Button variant="contained" onClick={openCreateDialog}>
            New patient
          </Button>
        }
      />

      <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
        <TextField
          label="Search by name or species"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          sx={{ flex: 1, maxWidth: 400 }}
          disabled={loading}
        />
        <Button variant="outlined" onClick={handleSearch} disabled={loading}>
          Search
        </Button>
      </Box>

      {loading ? (
        <TableSkeleton columns={4} headers={["Name", "Species", "Breed", "Owner"]} />
      ) : loadError ? (
        <ErrorState
          title="Couldn't load patients"
          message="Please check your connection and try again."
          details={loadError}
          onRetry={() => loadPatients(search || undefined)}
        />
      ) : patients.length === 0 ? (
        <EmptyState
          title={search ? "No matching patients" : "No patients yet"}
          description={search ? "Try a different search term." : "Create your first patient to get started."}
          action={
            <Button variant="contained" onClick={openCreateDialog}>
              Create patient
            </Button>
          }
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Species</TableCell>
                <TableCell>Breed</TableCell>
                <TableCell>Owner</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {patients.map((p) => (
                <TableRow
                  key={p.id}
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() => router.push(`/patients/${p.id}`)}
                >
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.species}</TableCell>
                  <TableCell>{p.breed ?? "—"}</TableCell>
                  <TableCell>{p.owner.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Create Patient Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Patient</DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, pt: "16px !important" }}>
          <TextField
            label="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <TextField
            label="Species"
            required
            value={form.species}
            onChange={(e) => setForm({ ...form, species: e.target.value })}
          />
          <TextField
            label="Breed"
            value={form.breed}
            onChange={(e) => setForm({ ...form, breed: e.target.value })}
          />
          <TextField
            select
            label="Owner"
            required
            value={form.ownerId}
            onChange={(e) => setForm({ ...form, ownerId: e.target.value })}
          >
            {owners.map((o) => (
              <MenuItem key={o.id} value={o.id}>
                {o.name}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Birthdate"
            type="date"
            value={form.birthdate}
            onChange={(e) => setForm({ ...form, birthdate: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Microchip ID"
            value={form.microchipId}
            onChange={(e) => setForm({ ...form, microchipId: e.target.value })}
          />
          <TextField
            label="Allergies"
            value={form.allergies}
            onChange={(e) => setForm({ ...form, allergies: e.target.value })}
          />
          <TextField
            label="Chronic Conditions"
            value={form.chronicConditions}
            onChange={(e) => setForm({ ...form, chronicConditions: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={submitting || !form.name || !form.species || !form.ownerId}
            onClick={handleCreate}
          >
            {submitting ? "Creating..." : "Create"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
