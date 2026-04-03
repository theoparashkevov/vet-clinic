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
import Collapse from "@mui/material/Collapse";
import ScienceIcon from "@mui/icons-material/Science";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MedicationIcon from "@mui/icons-material/Medication";
import NoteIcon from "@mui/icons-material/Note";
import PeopleIcon from "@mui/icons-material/People";
import SettingsIcon from "@mui/icons-material/Settings";
import DashboardIcon from "@mui/icons-material/Dashboard";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const DRAWER_WIDTH = 280;

interface MenuItem {
  href: string;
  label: string;
  icon: React.ElementType;
  description: string;
  children?: { href: string; label: string; icon: React.ElementType }[];
}

const menuItems: MenuItem[] = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon, description: "Overview & stats" },
  {
    href: "/admin/billing",
    label: "Billing",
    icon: AttachMoneyIcon,
    description: "Invoices & payments",
    children: [
      { href: "/admin/billing/dashboard", label: "Dashboard", icon: DashboardIcon },
      { href: "/admin/billing/invoices", label: "Invoices", icon: ReceiptIcon },
    ],
  },
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
  const [expandedItems, setExpandedItems] = useState<string[]>(["/admin/billing"]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isItemActive = (item: MenuItem) => {
    if (pathname === item.href) return true;
    if (item.children) {
      return item.children.some((child) => pathname === child.href);
    }
    return false;
  };

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            boxSizing: "border-box",
            backgroundColor: "#FFFFFF",
            borderRight: "1px solid #E7E5E4",
            boxShadow: "4px 0 24px rgba(0, 0, 0, 0.02)",
          },
        }}
      >
        <Box
          sx={{
            p: 3,
            background: "linear-gradient(135deg, #0D7377 0%, #14A098 100%)",
            color: "white",
          }}
        >
          <Box
            component={Link}
            href="/"
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              color: "rgba(255,255,255,0.85)",
              textDecoration: "none",
              mb: 3,
              fontSize: "0.8125rem",
              fontWeight: 500,
              transition: "all 0.2s ease",
              "&:hover": {
                color: "white",
                gap: 1.5,
              },
            }}
          >
            <ArrowBackIcon sx={{ fontSize: 18 }} />
            <span>Back to Clinic</span>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 3,
                backgroundColor: "rgba(255,255,255,0.15)",
                backdropFilter: "blur(10px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "1px solid rgba(255,255,255,0.2)",
              }}
            >
              <LocalHospitalIcon sx={{ color: "white", fontSize: 26 }} />
            </Box>
            <Box>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: "white", lineHeight: 1.3 }}>
                Admin Panel
              </Typography>
              <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
                Vet Clinic Management
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider />

        <Box sx={{ flex: 1, overflow: "auto", py: 2 }}>
          <List sx={{ px: 2 }}>
            {menuItems.map((item) => {
              const isActive = isItemActive(item);
              const isExpanded = expandedItems.includes(item.href);
              const IconComponent = item.icon;
              const hasChildren = item.children && item.children.length > 0;

              return (
                <Box key={item.href}>
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <Tooltip title={item.description} placement="right" arrow>
                      <ListItemButton
                        selected={isActive && !hasChildren}
                        onClick={() => {
                          if (hasChildren) {
                            toggleExpand(item.href);
                          } else {
                            router.push(item.href);
                          }
                        }}
                        sx={{
                          borderRadius: 3,
                          py: 1.25,
                          px: 2,
                          transition: "all 0.2s ease",
                          "&:hover": {
                            backgroundColor: "rgba(13, 115, 119, 0.06)",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "#0D7377",
                            color: "white",
                            boxShadow: "0 4px 14px rgba(13, 115, 119, 0.25)",
                            "&:hover": {
                              backgroundColor: "#0A5A5D",
                            },
                          },
                        }}
                      >
                        <ListItemIcon
                          sx={{
                            minWidth: 40,
                            color: isActive ? "white" : "#57534E",
                          }}
                        >
                          <IconComponent sx={{ fontSize: 22 }} />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              fontWeight={isActive ? 600 : 500}
                              sx={{ color: isActive ? "white" : "#1C1917" }}
                            >
                              {item.label}
                            </Typography>
                          }
                        />
                        {hasChildren && (
                          <Box sx={{ color: isActive ? "white" : "#A8A29E", ml: 1 }}>
                            {isExpanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                          </Box>
                        )}
                      </ListItemButton>
                    </Tooltip>
                  </ListItem>

                  {hasChildren && (
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <List sx={{ pl: 2, pr: 1 }}>
                        {item.children!.map((child) => {
                          const isChildActive = pathname === child.href;
                          const ChildIcon = child.icon;
                          return (
                            <ListItem key={child.href} disablePadding sx={{ mb: 0.5 }}>
                              <ListItemButton
                                selected={isChildActive}
                                onClick={() => router.push(child.href)}
                                sx={{
                                  borderRadius: 2.5,
                                  py: 1,
                                  px: 2,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    backgroundColor: "rgba(13, 115, 119, 0.06)",
                                  },
                                  "&.Mui-selected": {
                                    backgroundColor: "#0D7377",
                                    color: "white",
                                    boxShadow: "0 2px 8px rgba(13, 115, 119, 0.2)",
                                    "&:hover": {
                                      backgroundColor: "#0A5A5D",
                                    },
                                  },
                                }}
                              >
                                <ListItemIcon
                                  sx={{
                                    minWidth: 32,
                                    color: isChildActive ? "white" : "#78716C",
                                  }}
                                >
                                  <ChildIcon sx={{ fontSize: 18 }} />
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body2"
                                      fontWeight={isChildActive ? 600 : 500}
                                      sx={{ color: isChildActive ? "white" : "#44403C", fontSize: "0.8125rem" }}
                                    >
                                      {child.label}
                                    </Typography>
                                  }
                                />
                                {isChildActive && (
                                  <ChevronRightIcon sx={{ fontSize: 16, color: "white" }} />
                                )}
                              </ListItemButton>
                            </ListItem>
                          );
                        })}
                      </List>
                    </Collapse>
                  )}
                </Box>
              );
            })}
          </List>
        </Box>

        <Box
          sx={{
            p: 3,
            borderTop: "1px solid #E7E5E4",
            backgroundColor: "#FAFAF9",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: 2.5,
                backgroundColor: "#E7E5E4",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="caption" fontWeight={700} color="#57534E">
                AD
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" fontWeight={600} color="#1C1917">
                Admin User
              </Typography>
              <Typography variant="caption" color="#78716C">
                admin@vetclinic.com
              </Typography>
            </Box>
          </Box>
          <Typography variant="caption" color="#A8A29E" sx={{ display: "block", textAlign: "center" }}>
            Vet Clinic v1.4
          </Typography>
        </Box>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          minHeight: "100vh",
          backgroundColor: "#FAFAF8",
          backgroundImage: "radial-gradient(circle at 100% 0%, rgba(13, 115, 119, 0.03) 0%, transparent 50%)",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}
