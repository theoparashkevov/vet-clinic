"use client";

import type { ReactNode } from "react";
import { Suspense, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PetsIcon from "@mui/icons-material/Pets";
import EventIcon from "@mui/icons-material/Event";
import PeopleIcon from "@mui/icons-material/People";
import LogoutIcon from "@mui/icons-material/Logout";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import NotificationsIcon from "@mui/icons-material/Notifications";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ScienceIcon from "@mui/icons-material/Science";
import VaccinesIcon from "@mui/icons-material/Vaccines";
import MedicationIcon from "@mui/icons-material/Medication";
import NoteIcon from "@mui/icons-material/Note";
import SettingsIcon from "@mui/icons-material/Settings";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import ReceiptIcon from "@mui/icons-material/Receipt";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Collapse from "@mui/material/Collapse";
import { ThemeToggleButton } from "../ThemeModeProvider";
import { useAuth } from "../AuthProvider";
import { useToast } from "../ToastProvider";
import MyRemindersDialog from "../MyRemindersDialog";
import { useGlobalShortcuts } from "../KeyboardShortcuts";

const DRAWER_WIDTH = 280;

const mainNavItems = [
  { href: "/", label: "Home", icon: <DashboardIcon fontSize="small" /> },
  { href: "/patients", label: "Patients", icon: <PetsIcon fontSize="small" /> },
  { href: "/appointments", label: "Appointments", icon: <EventIcon fontSize="small" /> },
  { href: "/users", label: "Users", icon: <PeopleIcon fontSize="small" /> },
];

const adminMenuItems = [
  { href: "/admin", label: "Dashboard", icon: DashboardIcon },
  {
    href: "/admin/billing",
    label: "Billing",
    icon: AttachMoneyIcon,
    children: [
      { href: "/admin/billing/dashboard", label: "Dashboard", icon: DashboardIcon },
      { href: "/admin/billing/invoices", label: "Invoices", icon: ReceiptIcon },
    ],
  },
  { href: "/admin/lab-panels", label: "Lab Panels", icon: ScienceIcon },
  { href: "/admin/vaccinations", label: "Vaccinations", icon: VaccinesIcon },
  { href: "/admin/medications", label: "Medications", icon: MedicationIcon },
  { href: "/admin/note-templates", label: "Note Templates", icon: NoteIcon },
  { href: "/admin/users", label: "Users", icon: PeopleIcon },
  { href: "/admin/settings", label: "Settings", icon: SettingsIcon },
];

// Loading skeleton to prevent layout shift
function AdminLayoutSkeleton() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Box
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E7E5E4",
        }}
      >
        <Box sx={{ p: 3 }}>
          <Skeleton variant="rectangular" width={200} height={40} />
        </Box>
        <Divider />
        <Box sx={{ p: 2 }}>
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} variant="rectangular" width="100%" height={40} sx={{ mb: 1 }} />
          ))}
        </Box>
      </Box>
      <Box sx={{ flexGrow: 1, p: 4 }}>
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={400} />
      </Box>
    </Box>
  );
}

function AdminSidebar({ pathname }: { pathname: string }) {
  const [expandedItems, setExpandedItems] = useState<string[]>(["/admin/billing"]);

  const toggleExpand = (href: string) => {
    setExpandedItems((prev) =>
      prev.includes(href) ? prev.filter((h) => h !== href) : [...prev, href]
    );
  };

  const isItemActive = (href: string, children?: { href: string }[]) => {
    if (pathname === href) return true;
    if (children) {
      return children.some((child) => pathname === child.href);
    }
    return false;
  };

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        display: { xs: "none", lg: "block" },
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          backgroundColor: "#FFFFFF",
          borderRight: "1px solid #E7E5E4",
          boxShadow: "none",
          position: "fixed",
          height: "100vh",
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #0D7377 0%, #14A098 100%)",
          color: "white",
        }}
      >
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowBackIcon sx={{ fontSize: 18 }} />}
          sx={{
            color: "rgba(255,255,255,0.85)",
            textTransform: "none",
            fontSize: "0.8125rem",
            fontWeight: 500,
            mb: 3,
            justifyContent: "flex-start",
            p: 0,
            minWidth: 0,
            "&:hover": {
              color: "white",
              backgroundColor: "transparent",
            },
          }}
        >
          Back to Clinic
        </Button>

        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              backgroundColor: "rgba(255,255,255,0.15)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.2)",
            }}
          >
            <LocalHospitalIcon sx={{ color: "white", fontSize: 26 }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: "white", lineHeight: 1.3 }}>
              Admin Panel
            </Typography>
            <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.7)", fontWeight: 500 }}>
              Vet Clinic Management
            </Typography>
          </Box>
        </Stack>
      </Box>

      <Divider />

      {/* Navigation */}
      <Box sx={{ flex: 1, overflow: "auto", py: 2 }}>
        <List sx={{ px: 2 }}>
          {adminMenuItems.map((item) => {
            const isActive = isItemActive(item.href, item.children);
            const isExpanded = expandedItems.includes(item.href);
            const IconComponent = item.icon;
            const hasChildren = item.children && item.children.length > 0;

            return (
              <Box key={item.href}>
                <ListItemButton
                  selected={isActive && !hasChildren}
                  onClick={() => {
                    if (hasChildren) {
                      toggleExpand(item.href);
                    }
                  }}
                  component={hasChildren ? "div" : Link}
                  href={hasChildren ? undefined : item.href}
                  sx={{
                    borderRadius: 3,
                    py: 1.25,
                    px: 2,
                    mb: 0.5,
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

                {hasChildren && (
                  <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                    <List sx={{ pl: 2, pr: 1 }}>
                      {item.children!.map((child) => {
                        const isChildActive = pathname === child.href;
                        const ChildIcon = child.icon;
                        return (
                          <ListItemButton
                            key={child.href}
                            selected={isChildActive}
                            component={Link}
                            href={child.href}
                            sx={{
                              borderRadius: 2.5,
                              py: 1,
                              px: 2,
                              mb: 0.5,
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
                                  sx={{ 
                                    color: isChildActive ? "white" : "#44403C", 
                                    fontSize: "0.8125rem" 
                                  }}
                                >
                                  {child.label}
                                </Typography>
                              }
                            />
                            {isChildActive && (
                              <ChevronRightIcon sx={{ fontSize: 16, color: "white" }} />
                            )}
                          </ListItemButton>
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

      <Divider />

      {/* Footer */}
      <Box sx={{ p: 3, backgroundColor: "#FAFAF9" }}>
        <Stack direction="row" spacing={2} alignItems="center" mb={2}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: "#E7E5E4", color: "#57534E" }}>
            AD
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={600} color="#1C1917">
              Admin User
            </Typography>
            <Typography variant="caption" color="#78716C">
              admin@vetclinic.com
            </Typography>
          </Box>
        </Stack>
        <Typography variant="caption" color="#A8A29E" sx={{ display: "block", textAlign: "center" }}>
          Vet Clinic v1.4
        </Typography>
      </Box>
    </Drawer>
  );
}

function AdminTopNav() {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((p) => p[0]?.toUpperCase())
        .join("")
    : "U";

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <>
      <AppBar 
        position="fixed" 
        elevation={0}
        sx={{ 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          borderBottom: "1px solid rgba(15, 23, 42, 0.10)",
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          <Container 
            maxWidth="xl" 
            sx={{ 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "space-between",
              pl: { lg: `${DRAWER_WIDTH + 24}px !important` },
            }}
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              {isMobile && (
                <IconButton
                  aria-label="Open navigation"
                  onClick={() => setMobileDrawerOpen(true)}
                  edge="start"
                  sx={{ mr: 0.5 }}
                >
                  <MenuIcon />
                </IconButton>
              )}

              <Typography
                component={Link}
                href="/"
                variant="h6"
                color="text.primary"
                sx={{ textDecoration: "none", letterSpacing: "-0.02em" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <Avatar
                    variant="rounded"
                    sx={{
                      width: 28,
                      height: 28,
                      bgcolor: "primary.main",
                      borderRadius: 2,
                    }}
                  >
                    <LocalHospitalIcon fontSize="small" />
                  </Avatar>
                  <span>Vet Clinic</span>
                </Stack>
              </Typography>

              {!isMobile && (
                <Stack component="nav" aria-label="Primary" direction="row" spacing={0.5} sx={{ ml: 3 }}>
                  {mainNavItems.map((item) => (
                    <Button
                      key={item.href}
                      component={Link}
                      href={item.href}
                      color={isActive(item.href) ? "primary" : "inherit"}
                      startIcon={item.icon}
                      variant={isActive(item.href) ? "contained" : "text"}
                      sx={{
                        borderRadius: 999,
                        px: 1.5,
                        ...(isActive(item.href)
                          ? { backgroundColor: "rgba(31,111,120,0.14)", boxShadow: "none" }
                          : null),
                      }}
                    >
                      {item.label}
                    </Button>
                  ))}
                </Stack>
              )}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                color="inherit"
                onClick={() => setRemindersOpen(true)}
                title="My Reminders"
              >
                <NotificationsIcon />
              </IconButton>
              <ThemeToggleButton />
              <Button
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                color="inherit"
                sx={{ borderRadius: 999, pl: 0.5, pr: 1.25 }}
                startIcon={<Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>{initials}</Avatar>}
              >
                <Box sx={{ textAlign: "left", display: { xs: "none", sm: "block" } }}>
                  <Typography variant="body2" sx={{ lineHeight: 1.2 }}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                    {user?.role}
                  </Typography>
                </Box>
              </Button>
              <Menu
                anchorEl={menuAnchor}
                open={menuOpen}
                onClose={() => setMenuAnchor(null)}
                transformOrigin={{ horizontal: "right", vertical: "top" }}
                anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
              >
                <Box sx={{ px: 2, py: 1 }}>
                  <Typography variant="subtitle2" fontWeight={600}>{user?.name}</Typography>
                  <Typography variant="caption" color="text.secondary">{user?.role}</Typography>
                </Box>
                <Divider />
                <MenuItem onClick={() => { setMenuAnchor(null); router.push("/admin"); }}>
                  <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Admin Panel</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setMenuAnchor(null); logout(); router.push("/login"); }}>
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Log out</ListItemText>
                </MenuItem>
              </Menu>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        sx={{ display: { lg: "none" } }}
      >
        <Box sx={{ width: 280 }}>
          {/* Mobile menu content */}
          <Box sx={{ p: 3, background: "linear-gradient(135deg, #0D7377 0%, #14A098 100%)" }}>
            <Typography variant="h6" sx={{ color: "white", mb: 1 }}>Admin Panel</Typography>
          </Box>
          <List sx={{ p: 2 }}>
            {adminMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <ListItemButton
                  key={item.href}
                  component={Link}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{ borderRadius: 2, mb: 0.5 }}
                >
                  <ListItemIcon><IconComponent /></ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              );
            })}
          </List>
        </Box>
      </Drawer>

      <MyRemindersDialog open={remindersOpen} onClose={() => setRemindersOpen(false)} />
    </>
  );
}

function AdminContent({ children }: { children: ReactNode }) {
  return (
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        minHeight: "100vh",
        pt: "64px", // Height of AppBar
        pl: { lg: `${DRAWER_WIDTH}px` },
        backgroundColor: "#FAFAF8",
        backgroundImage: "radial-gradient(circle at 100% 0%, rgba(13, 115, 119, 0.03) 0%, transparent 50%)",
      }}
    >
      <Container 
        maxWidth="xl" 
        sx={{ 
          py: { xs: 2, sm: 3, md: 4 },
          px: { xs: 2, sm: 3, md: 4 },
        }}
      >
        {children}
      </Container>
    </Box>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  
  // Register global keyboard shortcuts
  useGlobalShortcuts();

  return (
    <Suspense fallback={<AdminLayoutSkeleton />}>
      <Box sx={{ display: "flex" }}>
        <AdminTopNav />
        <AdminSidebar pathname={pathname} />
        <AdminContent>{children}</AdminContent>
      </Box>
    </Suspense>
  );
}

// Need to import useRouter for the logout function
import { useRouter } from "next/navigation";
