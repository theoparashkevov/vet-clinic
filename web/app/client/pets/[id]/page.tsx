"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PetsIcon from "@mui/icons-material/Pets";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import ScaleIcon from "@mui/icons-material/Scale";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import MedicalIcon from "@mui/icons-material/MedicalServices";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { apiJson, apiFetch, AuthError } from "../../../../lib/api";
import { useToast } from "../../../../components/ToastProvider";
import { VaccinationBadge } from "../../../../components/client/VaccinationBadge";
import { AppointmentCard } from "../../../../components/client/AppointmentCard";

interface WeightRecord {
  id: string;
  weight: number;
  date: string;
  notes?: string;
}

interface Vaccination {
  id: string;
  name: string;
  status: "current" | "due-soon" | "overdue";
  administeredDate: string;
  dueDate?: string;
  veterinarian?: string;
}

interface Appointment {
  id: string;
  date: string;
  time: string;
  reason: string;
  status: string;
  doctorName?: string;
}

interface VisitSummary {
  id: string;
  date: string;
  reason: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  doctorName?: string;
}

interface PetDetail {
  id: string;
  name: string;
  species: string;
  breed?: string;
  birthdate?: string;
  photoUrl?: string;
  weight?: number;
  microchipId?: string;
  vaccinationStatus: "current" | "due-soon" | "overdue";
  vaccinations: Vaccination[];
  weightHistory: WeightRecord[];
  upcomingAppointments: Appointment[];
  recentVisits: VisitSummary[];
}

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return value === index ? <Box sx={{ py: 2 }}>{children}</Box> : null;
}

export default function PetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const toast = useToast();
  const petId = params.id as string;

  const [pet, setPet] = useState<PetDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [downloadingCertificate, setDownloadingCertificate] = useState(false);

  useEffect(() => {
    loadPetDetail();
  }, [petId]);

  const loadPetDetail = async () => {
    try {
      setLoading(true);
      const data = await apiJson<PetDetail>(`/v1/client/pets/${petId}`);
      setPet(data);
    } catch (e: unknown) {
      if (e instanceof AuthError) {
        router.push("/client/login");
        return;
      }
      setError(e instanceof Error ? e.message : "Failed to load pet details");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async () => {
    try {
      setDownloadingCertificate(true);
      const response = await apiFetch(`/v1/client/pets/${petId}/vaccine-certificate`);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${pet?.name}-vaccine-certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Certificate downloaded successfully");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to download certificate");
    } finally {
      setDownloadingCertificate(false);
    }
  };

  const age = pet?.birthdate
    ? Math.floor(
        (new Date().getTime() - new Date(pet.birthdate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  if (loading) {
    return (
      <Box>
        <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 3, mb: 2 }} />
        <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3 }} />
      </Box>
    );
  }

  if (error || !pet) {
    return (
      <Box>
        <IconButton onClick={() => router.push("/client")} sx={{ mb: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Alert severity="error" sx={{ borderRadius: 2 }}>
          {error || "Pet not found"}
        </Alert>
      </Box>
    );
  }

  return (
    <Box>
      <IconButton
        onClick={() => router.push("/client")}
        sx={{
          mb: 2,
          color: "#8D6E63",
          backgroundColor: "rgba(139, 90, 43, 0.04)",
          "&:hover": {
            backgroundColor: "rgba(139, 90, 43, 0.08)",
          },
        }}
      >
        <ArrowBackIcon />
      </IconButton>

      <Card
        sx={{
          borderRadius: 4,
          overflow: "visible",
          mb: 3,
          boxShadow: "0 8px 32px rgba(139, 90, 43, 0.12)",
          background: "linear-gradient(135deg, #FFF 0%, #FDF8F3 100%)",
          border: "1px solid rgba(139, 90, 43, 0.06)",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: "flex", gap: 3, alignItems: "center" }}>
            <Avatar
              src={pet.photoUrl || undefined}
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                background: pet.photoUrl
                  ? "transparent"
                  : "linear-gradient(135deg, #E8843C 0%, #D46622 100%)",
                border: "4px solid white",
                boxShadow: "0 6px 20px rgba(232, 132, 60, 0.3)",
                fontSize: "2.5rem",
              }}
            >
              {!pet.photoUrl && <PetsIcon sx={{ fontSize: 48, color: "white" }} />}
            </Avatar>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 700,
                  color: "#5D4037",
                  mb: 0.5,
                  letterSpacing: "-0.02em",
                }}
              >
                {pet.name}
              </Typography>
              <Typography variant="body1" sx={{ color: "#8D6E63", mb: 1 }}>
                {pet.species}
                {pet.breed && ` • ${pet.breed}`}
                {age !== null && ` • ${age} year${age > 1 ? "s" : ""} old`}
              </Typography>

              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                <VaccinationBadge status={pet.vaccinationStatus} />
                {pet.weight && (
                  <Chip
                    size="small"
                    icon={<ScaleIcon sx={{ fontSize: 16, color: "#7B9E89" }} />}
                    label={`${pet.weight} kg`}
                    sx={{
                      backgroundColor: "#E8F5E9",
                      color: "#2E7D32",
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      height: 28,
                      borderRadius: 2,
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          {pet.microchipId && (
            <Paper
              sx={{
                mt: 2.5,
                p: 2,
                borderRadius: 2,
                backgroundColor: "rgba(139, 90, 43, 0.03)",
                border: "1px dashed rgba(139, 90, 43, 0.15)",
              }}
            >
              <Typography variant="caption" sx={{ color: "#A1887F", display: "block" }}>
                Microchip ID
              </Typography>
              <Typography variant="body2" sx={{ color: "#5D4037", fontWeight: 600, fontFamily: "monospace" }}>
                {pet.microchipId}
              </Typography>
            </Paper>
          )}
        </CardContent>
      </Card>

      <Button
        variant="outlined"
        fullWidth
        startIcon={<FileDownloadIcon />}
        onClick={handleDownloadCertificate}
        disabled={downloadingCertificate}
        sx={{
          mb: 3,
          py: 1.5,
          borderRadius: 3,
          borderColor: "#E8843C",
          color: "#E8843C",
          fontWeight: 600,
          textTransform: "none",
          borderWidth: 2,
          "&:hover": {
            borderColor: "#D46622",
            backgroundColor: "rgba(232, 132, 60, 0.04)",
            borderWidth: 2,
          },
        }}
      >
        {downloadingCertificate ? "Downloading..." : "Download Vaccine Certificate"}
      </Button>

      <Box sx={{ borderBottom: 1, borderColor: "rgba(139, 90, 43, 0.12)" }}>
        <Tabs
          value={activeTab}
          onChange={(_, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
          textColor="primary"
          sx={{
            "& .MuiTabs-flexContainer": {
              gap: 1,
            },
            "& .MuiTab-root": {
              borderRadius: 2,
              minHeight: 44,
              textTransform: "none",
              fontWeight: 600,
              color: "#8D6E63",
              "&.Mui-selected": {
                backgroundColor: "rgba(232, 132, 60, 0.08)",
                color: "#E8843C",
              },
            },
          }}
        >
          <Tab icon={<VaccinesIcon />} iconPosition="start" label="Vaccines" />
          <Tab icon={<ScaleIcon />} iconPosition="start" label="Weight" />
          <Tab icon={<CalendarIcon />} iconPosition="start" label="Visits" />
        </Tabs>
      </Box>

      <TabPanel value={activeTab} index={0}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#5D4037" }}>
            Vaccinations
          </Typography>
          <Button
            size="small"
            endIcon={<ChevronRightIcon />}
            onClick={() => router.push(`/client/pets/${petId}/vaccinations`)}
            sx={{ color: "#E8843C", fontWeight: 600, textTransform: "none" }}
          >
            View All
          </Button>
        </Box>

        {pet.vaccinations.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "rgba(139, 90, 43, 0.02)",
              border: "1px dashed rgba(139, 90, 43, 0.2)",
            }}
          >
            <VaccinesIcon sx={{ fontSize: 48, color: "#A1887F", mb: 1, opacity: 0.5 }} />
            <Typography variant="body1" sx={{ color: "#8D6E63" }}>
              No vaccination records yet
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {pet.vaccinations.slice(0, 5).map((vax) => (
              <Paper
                key={vax.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  border: "1px solid rgba(139, 90, 43, 0.06)",
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#5D4037" }}>
                    {vax.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#8D6E63" }}>
                    Administered: {new Date(vax.administeredDate).toLocaleDateString()}
                    {vax.veterinarian && ` by Dr. ${vax.veterinarian}`}
                  </Typography>
                </Box>
                <VaccinationBadge status={vax.status} size="small" />
              </Paper>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={1}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#5D4037", mb: 2 }}>
          Weight History
        </Typography>

        {pet.weightHistory.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "rgba(139, 90, 43, 0.02)",
              border: "1px dashed rgba(139, 90, 43, 0.2)",
            }}
          >
            <ScaleIcon sx={{ fontSize: 48, color: "#A1887F", mb: 1, opacity: 0.5 }} />
            <Typography variant="body1" sx={{ color: "#8D6E63" }}>
              No weight records yet
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {pet.weightHistory.slice(0, 5).map((record) => (
              <Paper
                key={record.id}
                sx={{
                  p: 2,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  backgroundColor: "white",
                  border: "1px solid rgba(139, 90, 43, 0.06)",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: "rgba(123, 158, 137, 0.1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <ScaleIcon sx={{ fontSize: 20, color: "#7B9E89" }} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "#5D4037" }}>
                      {record.weight} kg
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#8D6E63" }}>
                      {new Date(record.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </Typography>
                  </Box>
                </Box>
                {record.notes && (
                  <Typography variant="caption" sx={{ color: "#A1887F", maxWidth: 150, textAlign: "right" }}>
                    {record.notes}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}
      </TabPanel>

      <TabPanel value={activeTab} index={2}>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#5D4037", mb: 2 }}>
          Recent Visits
        </Typography>

        {pet.recentVisits.length === 0 ? (
          <Paper
            sx={{
              p: 4,
              textAlign: "center",
              borderRadius: 3,
              backgroundColor: "rgba(139, 90, 43, 0.02)",
              border: "1px dashed rgba(139, 90, 43, 0.2)",
            }}
          >
            <MedicalIcon sx={{ fontSize: 48, color: "#A1887F", mb: 1, opacity: 0.5 }} />
            <Typography variant="body1" sx={{ color: "#8D6E63" }}>
              No visit records yet
            </Typography>
          </Paper>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            {pet.recentVisits.slice(0, 3).map((visit) => (
              <Paper
                key={visit.id}
                sx={{
                  p: 2.5,
                  borderRadius: 2,
                  backgroundColor: "white",
                  border: "1px solid rgba(139, 90, 43, 0.06)",
                }}
              >
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#5D4037" }}>
                    {visit.reason}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#8D6E63" }}>
                    {new Date(visit.date).toLocaleDateString()}
                  </Typography>
                </Box>
                {visit.diagnosis && (
                  <Typography variant="body2" sx={{ color: "#5D4037", mb: 0.5 }}>
                    <strong>Diagnosis:</strong> {visit.diagnosis}
                  </Typography>
                )}
                {visit.treatment && (
                  <Typography variant="body2" sx={{ color: "#5D4037", mb: 0.5 }}>
                    <strong>Treatment:</strong> {visit.treatment}
                  </Typography>
                )}
                {visit.doctorName && (
                  <Typography variant="caption" sx={{ color: "#8D6E63" }}>
                    Seen by Dr. {visit.doctorName}
                  </Typography>
                )}
              </Paper>
            ))}
          </Box>
        )}

        {pet.upcomingAppointments.length > 0 && (
          <>
            <Typography variant="h6" sx={{ fontWeight: 700, color: "#5D4037", mt: 4, mb: 2 }}>
              Upcoming Appointments
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              {pet.upcomingAppointments.map((apt) => (
                <AppointmentCard
                  key={apt.id}
                  id={apt.id}
                  date={apt.date}
                  time={apt.time}
                  petName={pet.name}
                  reason={apt.reason}
                  status={apt.status as any}
                  doctorName={apt.doctorName}
                />
              ))}
            </Box>
          </>
        )}
      </TabPanel>
    </Box>
  );
}
