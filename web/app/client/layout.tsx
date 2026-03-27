"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import PetsIcon from "@mui/icons-material/Pets";
import CalendarIcon from "@mui/icons-material/CalendarToday";
import LogoutIcon from "@mui/icons-material/Logout";
import { apiJson } from "../../lib/api";
import { useToast } from "../../components/ToastProvider";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth and role
    apiJson<User>("/v1/auth/me")
      .then((user) => {
        if (user.role !== "client") {
          // Not a client, redirect to login
          router.push("/login");
          return;
        }
        setUser(user);
        setLoading(false);
      })
      .catch(() => {
        // Not authenticated
        router.push("/login");
      });
  }, [router]);

  const handleLogout = async () => {
    try {
      await apiJson("/v1/auth/logout", { method: "POST" });
    } catch {
      // Ignore error
    }
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    router.push("/login");
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  const navItems = [
    { label: "My Pets", href: "/client", icon: <PetsIcon sx={{ mr: 1 }} /> },
    { label: "Appointments", href: "/client/appointments", icon: <CalendarIcon sx={{ mr: 1 }} /> },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      {/* Client App Bar */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            VetClinic Portal
          </Typography>
          
          <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
            {navItems.map((item) => (
              <Button
                key={item.href}
                color="inherit"
                startIcon={item.icon}
                onClick={() => router.push(item.href)}
                sx={{
                  color: pathname === item.href ? "primary.main" : "inherit",
                  fontWeight: pathname === item.href ? 600 : 400,
                }}
              >
                {item.label}
              </Button>
            ))}
            
            <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
              {user?.name}
            </Typography>
            
            <Button
              color="inherit"
              startIcon={<LogoutIcon />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Main Content */}
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flex: 1 }}>
        {children}
      </Container>

      {/* Footer */}
      <Box component="footer" sx={{ py: 2, textAlign: "center", borderTop: 1, borderColor: "divider" }}>
        <Typography variant="body2" color="text.secondary">
          © 2026 VetClinic. All rights reserved.
        </Typography>
      </Box>
    </Box>
  );
}
