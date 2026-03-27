"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import MedicationIcon from "@mui/icons-material/Medication";
import WarningIcon from "@mui/icons-material/Warning";
import PetsIcon from "@mui/icons-material/Pets";
import ErrorIcon from "@mui/icons-material/Error";
import InfoIcon from "@mui/icons-material/Info";
import CloseIcon from "@mui/icons-material/Close";

type Alert = {
  id: string;
  type: "allergy" | "chronic_condition" | "medication" | "behavioral" | "other";
  severity: "critical" | "warning" | "info";
  description: string;
};

type Props = {
  alerts: Alert[];
};

const typeIcons = {
  allergy: ErrorIcon,
  chronic_condition: MedicationIcon,
  medication: MedicationIcon,
  behavioral: PetsIcon,
  other: InfoIcon,
};

const typeLabels = {
  allergy: "Allergy",
  chronic_condition: "Chronic Condition",
  medication: "Medication",
  behavioral: "Behavioral",
  other: "Note",
};

const severityColors = {
  critical: "error" as const,
  warning: "warning" as const,
  info: "info" as const,
};

export default function PatientAlertBanner({ alerts }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);

  if (!alerts || alerts.length === 0) return null;

  const visibleAlerts = alerts.filter((a) => !dismissed.includes(a.id));

  if (visibleAlerts.length === 0) return null;

  // Separate by severity
  const criticalAlerts = visibleAlerts.filter((a) => a.severity === "critical");
  const warningAlerts = visibleAlerts.filter((a) => a.severity === "warning");
  const infoAlerts = visibleAlerts.filter((a) => a.severity === "info");

  const hasCritical = criticalAlerts.length > 0;

  return (
    <Box sx={{ mb: 3 }}>
      <Collapse in={expanded}>
        {hasCritical && (
          <Alert
            severity="error"
            variant="filled"
            sx={{ mb: 1 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setExpanded(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <AlertTitle>Critical Patient Alerts</AlertTitle>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {criticalAlerts.map((alert) => (
                <li key={alert.id}>
                  <strong>{typeLabels[alert.type]}:</strong> {alert.description}
                </li>
              ))}
            </Box>
          </Alert>
        )}

        {(warningAlerts.length > 0 || infoAlerts.length > 0) && (
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {warningAlerts.map((alert) => {
              const Icon = typeIcons[alert.type];
              return (
                <Alert
                  key={alert.id}
                  severity="warning"
                  icon={<Icon />}
                  sx={{ flex: "1 1 auto", minWidth: 250 }}
                >
                  <strong>{typeLabels[alert.type]}:</strong> {alert.description}
                </Alert>
              );
            })}
            {infoAlerts.map((alert) => {
              const Icon = typeIcons[alert.type];
              return (
                <Alert
                  key={alert.id}
                  severity="info"
                  icon={<Icon />}
                  sx={{ flex: "1 1 auto", minWidth: 250 }}
                >
                  <strong>{typeLabels[alert.type]}:</strong> {alert.description}
                </Alert>
              );
            })}
          </Box>
        )}
      </Collapse>

      {!expanded && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Chip
            icon={<WarningIcon />}
            label={`${visibleAlerts.length} Alert${visibleAlerts.length > 1 ? "s" : ""}`}
            color={hasCritical ? "error" : "warning"}
            onClick={() => setExpanded(true)}
            clickable
          />
          {hasCritical && (
            <Typography variant="caption" color="error">
              Critical alerts hidden - click to view
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
