"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import ScienceIcon from "@mui/icons-material/Science";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MedicationIcon from "@mui/icons-material/Medication";
import NoteIcon from "@mui/icons-material/Note";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";

const DRAWER_WIDTH = 260;

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon, description: "Overview & stats" },
  { href: "/admin/lab-panels", label: "Lab Panels", icon: ScienceIcon, description: "Test panels & ranges" },
  { href: "/admin/vaccinations", label: "Vaccinations", icon: VaccinesIcon, description: "Vaccine types" },
  { href: "/admin/medications", label: "Medications", icon: MedicationIcon, description: "Prescription templates" },
  { href: "/admin/note-templates", label: "Note Templates", icon: NoteIcon, description: "Medical record templates" },
  { href: "/admin/users", label: "Users", icon: PeopleIcon, description: "Staff management" },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon, description: "Clinic configuration" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <Box sx={{ display: "flex" }}>
      {/* Sidebar */}
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "#f8fafc",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        {/* Header Section */}
        <Box
          sx={{
            p: 2.5,
            backgroundColor: "#1f2937",
            color: "white",
          }}
        >
          {/* Back to Clinic */}
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "rgba(255,255,255,0.8)",
              textDecoration: "none",
              mb: 2,
              fontSize: "0.875rem",
              transition: "color 0.2s",
              "&:hover": {
                color: "white",
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            <span>Back to Clinic</span>
          </Box>

          {/* Admin Panel Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 2,
                backgroundColor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LocalHospitalIcon sx={{ color: "white", fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "white", lineHeight: 1.2 }}>
                Admin
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.6)" }}>
                Panel
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        {/* Navigation Menu */}
        <List sx={{ px: 1.5, py: 2 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const IconComponent = item.icon;
            
            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <Tooltip title={item.description} placement="right" arrow>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => router.push(item.href)}
                    sx={{
                      borderRadius: 2,
                      py: 1.25,
                      px: 2,
                      transition: "all 0.2s ease",
                      "&:hover": {
                        backgroundColor: "rgba(31, 111, 120, 0.08)",
                      },
                      "&.Mui-selected": {
                        backgroundColor: "primary.main",
                        color: "white",
                        boxShadow: "0 2px 8px rgba(31, 111, 120, 0.25)",
                        "&:hover": {
                          backgroundColor: "primary.dark",
                        },
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isActive ? "white" : "text.secondary",
                      }}
                    >
                      <IconComponent sx={{ fontSize: 20 }} />
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Typography
                          variant="body2"
                          fontWeight={isActive ? 600 : 500}
                          sx={{ color: isActive ? "white" : "text.primary" }}
                        >
                          {item.label}
                        </Typography>
                      }
                    />
                  </ListItemButton>
                </Tooltip>
              </ListItem>
            );
          })}
        </List>

        {/* Footer Info */}
        <Box sx={{ mt: "auto", p: 2.5, borderTop: "1px solid", borderColor: "divider" }}>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", textAlign: "center" }}>
            Vet Clinic v1.4
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ display: "block", textAlign: "center", mt: 0.5 }}>
            Administration Panel
          </Typography>
        </Box>
      </Drawer>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
