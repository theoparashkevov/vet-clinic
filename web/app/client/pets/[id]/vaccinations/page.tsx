"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ScheduleIcon from "@mui/icons-material/Schedule";
import WarningIcon from "@mui/icons-material/Warning";
import { apiJson, AuthError } from "../../../../lib/api";
import { VaccinationBadge } from "../../../../components/client/VaccinationBadge";

interface Vaccination {
  id: string;
  name: string;
  status: "current" | "due-soon" | "overdue";
  administeredDate: string;
  dueDate?: string;
  veterinarian?: string;
  lotNumber?: string;
  manufacturer?: string;
  notes?: string;
}

interface VaccinationHistory {
  petName: string;
  vaccinations: Vaccination[];
}

export default function VaccinationsPage() {
  const params = useParams();
  const router = useRouter();
  const petId = params.id as string;

  const [history, setHistory] = useState<VaccinationHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadVaccinationHistory();
  }, [petId]);

  const loadVaccinationHistory = async () => {
    try {
      setLoading(true);
      const data = await apiJson<VaccinationHistory>(`/v1/client/pets/${petId}/vaccinations`);
      setHistory(data);
    } catch (e: unknown) {
      if (e instanceof AuthError) {
        router.push("/client/login");
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load vaccination history");
    } finally {
      setLoading(false);
    }
  };

  const groupVaccinationsByStatus = (vaccinations: Vaccination[]) => {
    return {
      current: vaccinations.filter((v) => v.status === "current"),
      dueSoon: vaccinations.filter((v) => v.status === "due-soon"),
      overdue: vaccinations.filter((v) => v.status === "overdue"),
    };
  };

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3, mb: 2 }} />
        <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error || !history) {
    return (
      <Box>
        <IconButton onClick={() => router.back()} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || "Vaccination history not found"}
        </Alert>
      </Box>
    );
  }

  const grouped = groupVaccinationsByStatus(history.vaccinations);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
        <IconButton
          onClick={() => router.back()}
          sx={{
            color: "#8D6E63",
            backgroundColor: "rgba(139, 90, 43, 0.04)",
            "&:hover": {
              backgroundColor: "rgba(139, 90, 43, 0.08)",
            },
          }}
        >
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700, color: "#5D4037" }}>
            Vaccination History
          </Typography>
          <Typography variant="body2" sx={{ color: "#8D6E63" }}>
            {history.petName}
          </Typography>
        </Box>
      </Box>

      {history.vaccinations.length === 0 ? (
        <Paper
          sx={{
            p: 6,
            textAlign: "center",
            borderRadius: 4,
            backgroundColor: "rgba(139, 90, 43, 0.02)",
            border: "1px dashed rgba(139, 90, 43, 0.2)",
          }}
        >
          <VaccinesIcon sx={{ fontSize: 64, color: "#A1887F", mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" sx={{ color: "#5D4037", mb: 1 }}>
            No Vaccination Records
          </Typography>
          <Typography variant="body2" sx={{ color: "#8D6E63" }}>
            Your pets vaccination records will appear here once theyre added by the clinic.
          </Typography>
        </Paper>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {grouped.overdue.length > 0 && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <WarningIcon sx={{ color: "#F44336" }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#C62828" }}>
                  Overdue ({grouped.overdue.length})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {grouped.overdue.map((vax) => (
                  <VaccinationCard key={vax.id} vaccination={vax} />
                ))}
              </Box>
            </Box>
          )}

          {grouped.dueSoon.length > 0 && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <ScheduleIcon sx={{ color: "#FF9800" }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#E65100" }}>
                  Due Soon ({grouped.dueSoon.length})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {grouped.dueSoon.map((vax) => (
                  <VaccinationCard key={vax.id} vaccination={vax} />
                ))}
              </Box>
            </Box>
          )}

          {grouped.current.length > 0 && (
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                <CheckCircleIcon sx={{ color: "#4CAF50" }} />
                <Typography variant="h6" sx={{ fontWeight: 700, color: "#2E7D32" }}>
                  Current ({grouped.current.length})
                </Typography>
              </Box>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                {grouped.current.map((vax) => (
                  <VaccinationCard key={vax.id} vaccination={vax} />
                ))}
              </Box>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
}

function VaccinationCard({ vaccination }: { vaccination: Vaccination }) {
  return (
    <Paper
      sx={{
        p: 2.5,
        borderRadius: 3,
        backgroundColor: "white",
        border: "1px solid rgba(139, 90, 43, 0.06)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#5D4037", fontSize: "1.1rem" }}>
          {vaccination.name}
        </Typography>
        <VaccinationBadge status={vaccination.status} />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "rgba(232, 132, 60, 0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <CalendarIcon sx={{ fontSize: 16, color: "#E8843C" }} />
          </Box>
          <Box>
            <Typography variant="caption" sx={{ color: "#A1887F", display: "block" }}>
              Administered
            </Typography>
            <Typography variant="body2" sx={{ color: "#5D4037", fontWeight: 500 }}>
              {new Date(vaccination.administeredDate).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Typography>
          </Box>
        </Box>

        {vaccination.dueDate && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "rgba(255, 152, 0, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ScheduleIcon sx={{ fontSize: 16, color: "#FF9800" }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#A1887F", display: "block" }}>
                Next Due
              </Typography>
              <Typography variant="body2" sx={{ color: "#5D4037", fontWeight: 500 }}>
                {new Date(vaccination.dueDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Typography>
            </Box>
          </Box>
        )}

        {vaccination.veterinarian && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "rgba(139, 90, 43, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <PersonIcon sx={{ fontSize: 16, color: "#8D6E63" }} />
            </Box>
            <Box>
              <Typography variant="caption" sx={{ color: "#A1887F", display: "block" }}>
                Administered By
              </Typography>
              <Typography variant="body2" sx={{ color: "#5D4037", fontWeight: 500 }}>
                Dr. {vaccination.veterinarian}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {(vaccination.lotNumber || vaccination.manufacturer || vaccination.notes) && (
        <Box
          sx={{
            mt: 2,
            pt: 2,
            borderTop: "1px dashed rgba(139, 90, 43, 0.15)",
          }}
        >
          {vaccination.manufacturer && (
            <Typography variant="caption" sx={{ color: "#8D6E63", display: "block" }}>
              Manufacturer: {vaccination.manufacturer}
            </Typography>
          )}
          {vaccination.lotNumber && (
            <Typography variant="caption" sx={{ color: "#8D6E63", display: "block" }}>
              Lot #: {vaccination.lotNumber}
            </Typography>
          )}
          {vaccination.notes && (
            <Typography variant="caption" sx={{ color: "#8D6E63", display: "block", mt: 0.5 }}>
              Notes: {vaccination.notes}
            </Typography>
          )}
        </Box>
      )}
    </Paper>
  );
}
