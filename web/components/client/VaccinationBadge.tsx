import Chip from "@mui/material/Chip";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import ScheduleIcon from "@mui/icons-material/Schedule";

export type VaccinationStatus = "current" | "due-soon" | "overdue" | "scheduled";

interface VaccinationBadgeProps {
  status: VaccinationStatus;
  label?: string;
  size?: "small" | "medium";
  showIcon?: boolean;
}

export function VaccinationBadge({
  status,
  label,
  size = "small",
  showIcon = true,
}: VaccinationBadgeProps) {
  const configs = {
    current: {
      bg: "#E8F5E9",
      color: "#2E7D32",
      iconColor: "#4CAF50",
      icon: CheckCircleIcon,
      defaultLabel: "Current",
    },
    "due-soon": {
      bg: "#FFF3E0",
      color: "#E65100",
      iconColor: "#FF9800",
      icon: ScheduleIcon,
      defaultLabel: "Due Soon",
    },
    overdue: {
      bg: "#FFEBEE",
      color: "#C62828",
      iconColor: "#F44336",
      icon: ErrorIcon,
      defaultLabel: "Overdue",
    },
    scheduled: {
      bg: "#E3F2FD",
      color: "#01579B",
      iconColor: "#0288D1",
      icon: ScheduleIcon,
      defaultLabel: "Scheduled",
    },
  };

  const config = configs[status];
  const Icon = config.icon;

  return (
    <Chip
      size={size}
      icon={
        showIcon ? (
          <Icon sx={{ fontSize: size === "small" ? 16 : 20, color: config.iconColor }} />
        ) : undefined
      }
      label={label || config.defaultLabel}
      sx={{
        backgroundColor: config.bg,
        color: config.color,
        fontWeight: 600,
        fontSize: size === "small" ? "0.75rem" : "0.875rem",
        height: size === "small" ? 28 : 32,
        borderRadius: 2,
        "& .MuiChip-icon": {
          mr: 0.5,
        },
      }}
    />
  );
}
