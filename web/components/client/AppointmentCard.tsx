import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PetsIcon from "@mui/icons-material/Pets";
import LocationIcon from "@mui/icons-material/LocationOn";
import PersonIcon from "@mui/icons-material/Person";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in-progress"
  | "completed"
  | "cancelled"
  | "no-show";

export interface AppointmentCardProps {
  id: string;
  date: string;
  time: string;
  petName: string;
  petSpecies?: string;
  reason: string;
  status: AppointmentStatus;
  doctorName?: string;
  location?: string;
  notes?: string;
  onClick?: () => void;
}

export function AppointmentCard({
  date,
  time,
  petName,
  petSpecies,
  reason,
  status,
  doctorName,
  location,
  notes,
  onClick,
}: AppointmentCardProps) {
  const getStatusConfig = () => {
    switch (status) {
      case "scheduled":
        return {
          bg: "#E3F2FD",
          color: "#01579B",
          label: "Scheduled",
        };
      case "confirmed":
        return {
          bg: "#E8F5E9",
          color: "#2E7D32",
          label: "Confirmed",
        };
      case "in-progress":
        return {
          bg: "#FFF3E0",
          color: "#E65100",
          label: "In Progress",
        };
      case "completed":
        return {
          bg: "#F5F5F5",
          color: "#616161",
          label: "Completed",
        };
      case "cancelled":
        return {
          bg: "#FFEBEE",
          color: "#C62828",
          label: "Cancelled",
        };
      case "no-show":
        return {
          bg: "#FCE4EC",
          color: "#880E4F",
          label: "No Show",
        };
    }
  };

  const statusConfig = getStatusConfig();

  const isPast = status === "completed" || status === "cancelled" || status === "no-show";

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: isPast
          ? "0 2px 8px rgba(0, 0, 0, 0.04)"
          : "0 4px 20px rgba(139, 90, 43, 0.08)",
        border: "1px solid rgba(139, 90, 43, 0.06)",
        background: isPast ? "#FAFAFA" : "linear-gradient(135deg, #FFF 0%, #FDF8F3 100%)",
        opacity: isPast ? 0.85 : 1,
        "&:hover": onClick
          ? {
              transform: "translateY(-2px)",
              boxShadow: "0 8px 24px rgba(139, 90, 43, 0.12)",
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              minWidth: 56,
              p: 1,
              borderRadius: 2,
              background: isPast
                ? "rgba(0, 0, 0, 0.04)"
                : "linear-gradient(135deg, #E8843C 0%, #D46622 100%)",
              color: isPast ? "#8D6E63" : "white",
            }}
          >
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            >
              {new Date(date).toLocaleDateString("en-US", { month: "short" })}
            </Typography>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                lineHeight: 1,
                my: 0.25,
              }}
            >
              {new Date(date).getDate()}
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                opacity: 0.9,
              }}
            >
              {new Date(date).toLocaleDateString("en-US", { weekday: "short" })}
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", gap: 1, mb: 1, flexWrap: "wrap" }}>
              <Chip
                size="small"
                label={statusConfig.label}
                sx={{
                  backgroundColor: statusConfig.bg,
                  color: statusConfig.color,
                  fontWeight: 600,
                  fontSize: "0.7rem",
                  height: 22,
                  borderRadius: 1.5,
                }}
              />
            </Box>

            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: 700,
                color: "#5D4037",
                mb: 0.5,
                fontSize: "1rem",
              }}
            >
              {reason}
            </Typography>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                mb: 1,
              }}
            >
              <PetsIcon sx={{ fontSize: 14, color: "#A1887F" }} />
              <Typography variant="body2" sx={{ color: "#8D6E63" }}>
                {petName}
                {petSpecies && ` (${petSpecies})`}
              </Typography>
            </Box>

            <Box
              sx={{
                display: "flex",
                gap: 2,
                flexWrap: "wrap",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <AccessTimeIcon sx={{ fontSize: 14, color: "#A1887F" }} />
                <Typography variant="caption" sx={{ color: "#8D6E63" }}>
                  {time}
                </Typography>
              </Box>

              {doctorName && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <PersonIcon sx={{ fontSize: 14, color: "#A1887F" }} />
                  <Typography variant="caption" sx={{ color: "#8D6E63" }}>
                    Dr. {doctorName}
                  </Typography>
                </Box>
              )}

              {location && (
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <LocationIcon sx={{ fontSize: 14, color: "#A1887F" }} />
                  <Typography variant="caption" sx={{ color: "#8D6E63" }}>
                    {location}
                  </Typography>
                </Box>
              )}
            </Box>

            {notes && (
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  color: "#A1887F",
                  fontStyle: "italic",
                }}
              >
                {notes}
              </Typography>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}
