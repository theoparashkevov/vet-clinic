"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Toolbar from "@mui/material/Toolbar";
import ScienceIcon from "@mui/icons-material/Science";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MedicationIcon from "@mui/icons-material/Medication";
import NoteIcon from "@mui/icons-material/Note";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
const DRAWER_WIDTH = 260;
const menuItems = [
  { href: "/admin", label: "Dashboard", icon: <DashboardIcon /> },
  { href: "/admin/lab-panels", label: "Lab Panels", icon: <ScienceIcon /> },
  { href: "/admin/vaccinations", label: "Vaccination Types", icon: <VaccinesIcon /> },
  { href: "/admin/medications", label: "Medication Templates", icon: <MedicationIcon /> },
  { href: "/admin/note-templates", label: "Note Templates", icon: <NoteIcon /> },
  { href: "/admin/users", label: "User Management", icon: <PeopleIcon /> },
  { href: "/admin/settings", label: "Clinic Settings", icon: <SettingsIcon /> },
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
            backgroundColor: "background.paper",
            borderRight: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <Toolbar>
          <Typography variant="h6" fontWeight={600}>
            Admin Panel
          </Typography>
        </Toolbar>
        <List sx={{ pt: 0 }}>
          {menuItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            return (
              <ListItem key={item.href} disablePadding>
                <ListItemButton
                  selected={isActive}
                  onClick={() => router.push(item.href)}
                  sx={{
                    borderRadius: 1,
                    mx: 1,
                    mb: 0.5,
                    "&.Mui-selected": {
                      backgroundColor: "primary.light",
                      "&:hover": {
                        backgroundColor: "primary.light",
                      },
                    },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? "primary.main" : "inherit" }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>
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