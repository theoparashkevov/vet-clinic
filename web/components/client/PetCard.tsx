import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import PetsIcon from "@mui/icons-material/Pets";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import { keyframes } from "@mui/system";

export interface PetCardProps {
  id: string;
  name: string;
  species: string;
  breed?: string | null;
  birthdate?: string | null;
  photoUrl?: string | null;
  vaccinationStatus: "current" | "due-soon" | "overdue";
  upcomingAppointments: number;
  onClick?: () => void;
}

const pulse = keyframes`
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
`;

export function PetCard({
  name,
  species,
  breed,
  birthdate,
  photoUrl,
  vaccinationStatus,
  upcomingAppointments,
  onClick,
}: PetCardProps) {
  const getVaccinationColor = () => {
    switch (vaccinationStatus) {
      case "current":
        return {
          bg: "#E8F5E9",
          color: "#2E7D32",
          icon: "#4CAF50",
        };
      case "due-soon":
        return {
          bg: "#FFF3E0",
          color: "#E65100",
          icon: "#FF9800",
        };
      case "overdue":
        return {
          bg: "#FFEBEE",
          color: "#C62828",
          icon: "#F44336",
        };
    }
  };

  const vaxColors = getVaccinationColor();

  const age = birthdate
    ? Math.floor(
        (new Date().getTime() - new Date(birthdate).getTime()) /
          (365.25 * 24 * 60 * 60 * 1000)
      )
    : null;

  return (
    <Card
      onClick={onClick}
      sx={{
        borderRadius: 3,
        overflow: "visible",
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 20px rgba(139, 90, 43, 0.08)",
        border: "1px solid rgba(139, 90, 43, 0.06)",
        background: "linear-gradient(135deg, #FFF 0%, #FDF8F3 100%)",
        position: "relative",
        "&:hover": onClick
          ? {
              transform: "translateY(-4px)",
              boxShadow: "0 12px 40px rgba(139, 90, 43, 0.15)",
            }
          : {},
        "&:active": onClick
          ? {
              transform: "translateY(-2px)",
            }
          : {},
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", gap: 2.5, alignItems: "flex-start" }}>
          <Avatar
            src={photoUrl || undefined}
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              background: photoUrl
                ? "transparent"
                : "linear-gradient(135deg, #E8843C 0%, #D46622 100%)",
              border: "3px solid white",
              boxShadow: "0 4px 12px rgba(232, 132, 60, 0.25)",
              fontSize: "1.8rem",
            }}
          >
            {!photoUrl && <PetsIcon sx={{ fontSize: 32, color: "white" }} />}
          </Avatar>

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                color: "#5D4037",
                mb: 0.5,
                letterSpacing: "-0.01em",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {name}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#8D6E63",
                mb: 0.5,
              }}
            >
              {species}
              {breed && ` • ${breed}`}
            </Typography>
            {age !== null && (
              <Typography
                variant="caption"
                sx={{
                  color: "#A1887F",
                  display: "block",
                }}
              >
                {age === 0 ? "Less than 1 year old" : `${age} year${age > 1 ? "s" : ""} old`}
              </Typography>
            )}
          </Box>
        </Box>

        <Box
          sx={{
            mt: 2.5,
            pt: 2,
            borderTop: "1px dashed rgba(139, 90, 43, 0.12)",
            display: "flex",
            gap: 1.5,
            flexWrap: "wrap",
          }}
        >
          <Chip
            size="small"
            icon={
              <VaccinesIcon
                sx={{
                  fontSize: 16,
                  color: vaxColors.icon,
                  animation: vaccinationStatus === "overdue" ? `${pulse} 2s ease-in-out infinite` : "none",
                }}
              />
            }
            label={
              vaccinationStatus === "current"
                ? "Vaccines Current"
                : vaccinationStatus === "due-soon"
                ? "Due Soon"
                : "Overdue"
            }
            sx={{
              backgroundColor: vaxColors.bg,
              color: vaxColors.color,
              fontWeight: 600,
              fontSize: "0.75rem",
              height: 28,
              borderRadius: 2,
              "& .MuiChip-icon": {
                mr: 0.5,
              },
            }}
          />

          {upcomingAppointments > 0 && (
            <Chip
              size="small"
              icon={
                <CalendarIcon
                  sx={{
                    fontSize: 16,
                    color: "#0288D1",
                  }}
                />
              }
              label={`${upcomingAppointments} Upcoming`}
              sx={{
                backgroundColor: "#E3F2FD",
                color: "#01579B",
                fontWeight: 600,
                fontSize: "0.75rem",
                height: 28,
                borderRadius: 2,
                "& .MuiChip-icon": {
                  mr: 0.5,
                },
              }}
            />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
