"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
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
import { useAuth } from "./AuthProvider";
import FullPageLoading from "./FullPageLoading";
import { useToast } from "./ToastProvider";
import MyRemindersDialog from "./MyRemindersDialog";
import { PageTransition } from "./animations";

const PUBLIC_PATHS = new Set(["/login"]);

const navItems = [
  { href: "/", label: "Home", icon: <DashboardIcon fontSize="small" /> },
  { href: "/patients", label: "Patients", icon: <PetsIcon fontSize="small" /> },
  { href: "/appointments", label: "Appointments", icon: <EventIcon fontSize="small" /> },
  { href: "/users", label: "Users", icon: <PeopleIcon fontSize="small" /> },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const toast = useToast();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const isPublic = PUBLIC_PATHS.has(pathname);
  const [remindersOpen, setRemindersOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(menuAnchor);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isPublic && !isAuthenticated) {
      const nextPath = pathname || "/";
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  }, [isAuthenticated, isPublic, loading, pathname, router]);

  useEffect(() => {
    const onAuthError = (event: Event) => {
      if (isPublic) return;
      const detail = (event as CustomEvent<{ message?: string }>).detail;
      if (detail?.message) {
        toast.error(detail.message);
      }
      const nextPath = pathname || "/";
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    };

    window.addEventListener("vet-clinic-auth-error", onAuthError);
    return () => window.removeEventListener("vet-clinic-auth-error", onAuthError);
  }, [isPublic, pathname, router, toast]);

  if (!isPublic && (loading || !isAuthenticated)) {
    return <FullPageLoading label="Checking session..." />;
  }

  if (isPublic) {
    return <main>{children}</main>;
  }

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
      <AppBar position="sticky" elevation={0} sx={{ borderBottom: "1px solid rgba(15, 23, 42, 0.10)" }}>
        <Toolbar sx={{ minHeight: 64 }}>
          <Container maxWidth="lg" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Stack direction="row" spacing={1.5} alignItems="center">
              {isMobile ? (
                <IconButton
                  aria-label="Open navigation"
                  onClick={() => setDrawerOpen(true)}
                  edge="start"
                  sx={{ mr: 0.5 }}
                >
                  <MenuIcon />
                </IconButton>
              ) : null}

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

              {!isMobile ? (
                <Stack component="nav" aria-label="Primary" direction="row" spacing={0.5} sx={{ ml: 1.5 }}>
                  {navItems.map((item) => (
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
              ) : null}
            </Stack>

            <Stack direction="row" spacing={1} alignItems="center">
              <IconButton
                color="inherit"
                onClick={() => setRemindersOpen(true)}
                title="My Reminders"
              >
                <NotificationsIcon />
              </IconButton>
              <Button
                onClick={(e) => setMenuAnchor(e.currentTarget)}
                color="inherit"
                sx={{ borderRadius: 999, pl: 0.5, pr: 1.25 }}
                startIcon={<Avatar sx={{ width: 28, height: 28, bgcolor: "primary.main" }}>{initials}</Avatar>}
              >
                <Box sx={{ textAlign: "left" }}>
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
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    router.push("/admin");
                  }}
                >
                  <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Admin Panel</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem
                  onClick={() => {
                    setMenuAnchor(null);
                    logout();
                    router.push("/login");
                  }}
                >
                  <ListItemIcon><LogoutIcon fontSize="small" /></ListItemIcon>
                  <ListItemText>Log out</ListItemText>
                </MenuItem>
              </Menu>
            </Stack>
          </Container>
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ width: 280, p: 2 }}>
          <Typography variant="h6" sx={{ mb: 1 }}>Vet Clinic</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Signed in as {user?.name}
          </Typography>
          <Divider sx={{ mb: 1 }} />
          <List>
            {navItems.map((item) => (
              <ListItemButton
                key={item.href}
                selected={isActive(item.href)}
                onClick={() => {
                  setDrawerOpen(false);
                  router.push(item.href);
                }}
                sx={{ borderRadius: 2 }}
              >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            ))}
          </List>
          <Divider sx={{ my: 1 }} />
          <Button
            fullWidth
            variant="outlined"
            startIcon={<LogoutIcon />}
            onClick={() => {
              setDrawerOpen(false);
              logout();
              router.push("/login");
            }}
          >
            Log out
          </Button>
        </Box>
      </Drawer>

      <Box
        sx={{
          minHeight: "calc(100vh - 64px)",
          backgroundImage:
            "radial-gradient(900px 300px at 15% 0%, rgba(31,111,120,0.14), transparent 55%), radial-gradient(700px 260px at 90% 10%, rgba(193,106,67,0.12), transparent 52%)",
        }}
      >
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <PageTransition>
            {children}
          </PageTransition>
        </Container>
      </Box>

      <MyRemindersDialog
        open={remindersOpen}
        onClose={() => setRemindersOpen(false)}
      />
    </>
  );
}
