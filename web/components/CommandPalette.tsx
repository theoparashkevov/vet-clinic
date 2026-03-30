"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import TextField from "@mui/material/TextField";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PetsIcon from "@mui/icons-material/Pets";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ScienceIcon from "@mui/icons-material/Science";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MedicationIcon from "@mui/icons-material/Medication";
import NoteIcon from "@mui/icons-material/Note";
import SettingsIcon from "@mui/icons-material/Settings";
import { apiJson } from "../lib/api";

interface Command {
  id: string;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  category: string;
  shortcut?: string;
  action: () => void;
}

interface Patient {
  id: string;
  name: string;
  species: string;
  breed?: string;
}

const STATIC_COMMANDS: Omit<Command, "action">[] = [
  { id: "home", title: "Home", subtitle: "Go to dashboard", icon: <DashboardIcon />, category: "Navigation" },
  { id: "patients", title: "Patients", subtitle: "View all patients", icon: <PetsIcon />, category: "Navigation" },
  { id: "appointments", title: "Appointments", subtitle: "View schedule", icon: <EventIcon />, category: "Navigation" },
  { id: "users", title: "Users", subtitle: "Manage staff", icon: <PeopleIcon />, category: "Navigation" },
  { id: "admin", title: "Admin Panel", subtitle: "Manage clinic settings", icon: <AdminPanelSettingsIcon />, category: "Navigation" },
  { id: "admin-lab", title: "Lab Panels", subtitle: "Configure lab tests", icon: <ScienceIcon />, category: "Admin" },
  { id: "admin-vaccines", title: "Vaccinations", subtitle: "Manage vaccine types", icon: <VaccinesIcon />, category: "Admin" },
  { id: "admin-medications", title: "Medications", subtitle: "Manage templates", icon: <MedicationIcon />, category: "Admin" },
  { id: "admin-notes", title: "Note Templates", subtitle: "Manage templates", icon: <NoteIcon />, category: "Admin" },
  { id: "admin-settings", title: "Clinic Settings", subtitle: "Configure clinic", icon: <SettingsIcon />, category: "Admin" },
  { id: "new-patient", title: "New Patient", subtitle: "Create a new patient record", icon: <PetsIcon />, category: "Actions" },
  { id: "new-appointment", title: "New Appointment", subtitle: "Schedule an appointment", icon: <EventIcon />, category: "Actions" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("open-command-palette", () => setOpen(true));

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("open-command-palette", () => setOpen(true));
    };
  }, []);

  useEffect(() => {
    if (open && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query || query.length < 2) {
      setPatients([]);
      return;
    }

    const searchPatients = async () => {
      setLoading(true);
      try {
        const response = await apiJson<{ data: Patient[] }>(`/v1/patients?search=${encodeURIComponent(query)}&limit=5`);
        setPatients(response.data);
      } catch (error) {
        console.error("Failed to search patients:", error);
      } finally {
        setLoading(false);
      }
    };

    const timeoutId = setTimeout(searchPatients, 200);
    return () => clearTimeout(timeoutId);
  }, [query]);

  const commands = useMemo(() => {
    const staticCmds: Command[] = STATIC_COMMANDS.map((cmd) => ({
      ...cmd,
      action: () => {
        switch (cmd.id) {
          case "home":
            router.push("/");
            break;
          case "patients":
            router.push("/patients");
            break;
          case "appointments":
            router.push("/appointments");
            break;
          case "users":
            router.push("/users");
            break;
          case "admin":
            router.push("/admin");
            break;
          case "admin-lab":
            router.push("/admin/lab-panels");
            break;
          case "admin-vaccines":
            router.push("/admin/vaccinations");
            break;
          case "admin-medications":
            router.push("/admin/medications");
            break;
          case "admin-notes":
            router.push("/admin/note-templates");
            break;
          case "admin-settings":
            router.push("/admin/settings");
            break;
          case "new-patient":
            window.dispatchEvent(new CustomEvent("new-patient"));
            break;
          case "new-appointment":
            window.dispatchEvent(new CustomEvent("new-appointment"));
            break;
        }
        setOpen(false);
      },
    }));

    const patientCmds: Command[] = patients.map((patient) => ({
      id: `patient-${patient.id}`,
      title: patient.name,
      subtitle: `${patient.species}${patient.breed ? ` • ${patient.breed}` : ""}`,
      icon: <PetsIcon />,
      category: "Patients",
      action: () => {
        router.push(`/patients/${patient.id}`);
        setOpen(false);
      },
    }));

    return [...patientCmds, ...staticCmds];
  }, [patients, router]);

  const filteredCommands = useMemo(() => {
    if (!query) return commands;
    const lowerQuery = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(lowerQuery) ||
        cmd.subtitle?.toLowerCase().includes(lowerQuery) ||
        cmd.category.toLowerCase().includes(lowerQuery)
    );
  }, [commands, query]);

  const groupedCommands = useMemo(() => {
    const groups: { [key: string]: Command[] } = {};
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) groups[cmd.category] = [];
      groups[cmd.category].push(cmd);
    });
    return groups;
  }, [filteredCommands]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const flatCommands = Object.values(groupedCommands).flat();

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % flatCommands.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + flatCommands.length) % flatCommands.length);
          break;
        case "Enter":
          e.preventDefault();
          flatCommands[selectedIndex]?.action();
          break;
        case "Escape":
          e.preventDefault();
          setOpen(false);
          break;
      }
    },
    [groupedCommands, selectedIndex]
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  return (
    <Dialog
      open={open}
      onClose={() => setOpen(false)}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 3, overflow: "hidden" },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <TextField
          fullWidth
          inputRef={inputRef}
          placeholder="Search patients, pages, or actions..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          variant="standard"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <Chip label="ESC" size="small" variant="outlined" />
              </InputAdornment>
            ),
            disableUnderline: true,
          }}
          sx={{ mt: 1 }}
        />
      </DialogTitle>
      <DialogContent sx={{ pt: 0, pb: 2, minHeight: 300 }}>
        {filteredCommands.length === 0 ? (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography color="text.secondary">No results found</Typography>
          </Box>
        ) : (
          <List dense>
            {Object.entries(groupedCommands).map(([category, cmds]) => (
              <Box key={category}>
                <Typography
                  variant="caption"
                  sx={{
                    px: 2,
                    py: 0.5,
                    display: "block",
                    color: "text.secondary",
                    fontWeight: 600,
                  }}
                >
                  {category}
                </Typography>
                {cmds.map((cmd, index) => {
                  const flatIndex = Object.values(groupedCommands)
                    .flat()
                    .indexOf(cmd);
                  const isSelected = flatIndex === selectedIndex;

                  return (
                    <ListItem key={cmd.id} disablePadding>
                      <ListItemButton
                        selected={isSelected}
                        onClick={() => {
                          cmd.action();
                          setOpen(false);
                        }}
                        sx={{
                          borderRadius: 1,
                          mx: 1,
                          mb: 0.5,
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 40 }}>{cmd.icon}</ListItemIcon>
                        <ListItemText
                          primary={cmd.title}
                          secondary={cmd.subtitle}
                          primaryTypographyProps={{ fontWeight: 500 }}
                        />
                        {cmd.shortcut && (
                          <Chip
                            label={cmd.shortcut}
                            size="small"
                            variant="outlined"
                            sx={{ fontFamily: "monospace" }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </Box>
            ))}
          </List>
        )}

        <Box
          sx={{
            display: "flex",
            gap: 2,
            justifyContent: "center",
            pt: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            mt: 2,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            <KeyboardIcon sx={{ fontSize: 14, verticalAlign: "middle", mr: 0.5 }} />
            ↑↓ to navigate
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Enter to select
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Cmd/Ctrl + K to open
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
