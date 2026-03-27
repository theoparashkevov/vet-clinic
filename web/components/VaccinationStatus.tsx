"use client";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningIcon from "@mui/icons-material/Warning";
import ErrorIcon from "@mui/icons-material/Error";
import HelpIcon from "@mui/icons-material/Help";

type VaccinationStatus = {
  status: "current" | "due-soon" | "overdue";
  vaccinations: Array<{
    id: string;
    name: string;
    dueDate: string;
  }>;
};

type Props = {
  status: VaccinationStatus | null;
  size?: "small" | "medium";
};

export default function VaccinationStatus({ status, size = "medium" }: Props) {
  if (!status) {
    return (
      <Chip
        icon={<HelpIcon />}
        label="Unknown"
        size={size}
        variant="outlined"
      />
    );
  }

  const { status: statusType, vaccinations } = status;

  const config = {
    current: {
      icon: <CheckCircleIcon />,
      label: "Vaccines Current",
      color: "success" as const,
      tooltip: "All vaccinations are up to date",
    },
    "due-soon": {
      icon: <WarningIcon />,
      label: "Vaccines Due Soon",
      color: "warning" as const,
      tooltip: vaccinations.length > 0
        ? `Due within 30 days: ${vaccinations.map((v) => v.name).join(", ")}`
        : "Some vaccines due soon",
    },
    overdue: {
      icon: <ErrorIcon />,
      label: "Vaccines Overdue",
      color: "error" as const,
      tooltip: vaccinations.length > 0
        ? `Overdue: ${vaccinations.map((v) => v.name).join(", ")}`
        : "Some vaccines are overdue",
    },
  };

  const { icon, label, color, tooltip } = config[statusType];

  return (
    <Tooltip title={tooltip} arrow>
      <Chip
        icon={icon}
        label={label}
        color={color}
        size={size}
        sx={{
          fontWeight: 500,
          "& .MuiChip-icon": {
            fontSize: size === "small" ? 16 : 20,
          },
        }}
      />
    </Tooltip>
  );
}

// Compact version for patient list
export function VaccinationStatusDot({ status }: { status: VaccinationStatus | null }) {
  if (!status) {
    return (
      <Tooltip title="Vaccination status unknown">
        <Box
          sx={{
            width: 12,
            height: 12,
            borderRadius: "50%",
            bgcolor: "grey.400",
            display: "inline-block",
          }}
        />
      </Tooltip>
    );
  }

  const colors = {
    current: "success.main",
    "due-soon": "warning.main",
    overdue: "error.main",
  };

  const tooltips = {
    current: "All vaccines current",
    "due-soon": "Vaccines due within 30 days",
    overdue: "Vaccines overdue",
  };

  return (
    <Tooltip title={tooltips[status.status]} arrow>
      <Box
        sx={{
          width: 12,
          height: 12,
          borderRadius: "50%",
          bgcolor: colors[status.status],
          display: "inline-block",
          boxShadow: 1,
        }}
      />
    </Tooltip>
  );
}
