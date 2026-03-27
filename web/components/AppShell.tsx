"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import { useAuth } from "./AuthProvider";

const PUBLIC_PATHS = new Set(["/login"]);

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const isPublic = PUBLIC_PATHS.has(pathname);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!isPublic && !isAuthenticated) {
      const nextPath = pathname || "/";
      router.replace(`/login?next=${encodeURIComponent(nextPath)}`);
    }
  }, [isAuthenticated, isPublic, loading, pathname, router]);

  if (!isPublic && (loading || !isAuthenticated)) {
    return (
      <Box sx={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <CircularProgress size={20} />
          <Typography>Checking session...</Typography>
        </Box>
      </Box>
    );
  }

  if (isPublic) {
    return <main>{children}</main>;
  }

  return (
    <>
      <header style={{ padding: 16, borderBottom: '1px solid #eee', display: 'flex', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
          <strong>Vet Clinic</strong>
          <nav aria-label="Primary">
            <ul style={{ listStyle: 'none', display: 'flex', gap: 12, margin: 0, padding: 0 }}>
              <li><Link href="/">Dashboard</Link></li>
              <li><Link href="/patients">Patients</Link></li>
              <li><Link href="/appointments">Appointments</Link></li>
            </ul>
          </nav>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Typography variant="body2" color="text.secondary">
            {user?.name} ({user?.role})
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              logout();
              router.push("/login");
            }}
          >
            Log out
          </Button>
        </Box>
      </header>
      <main style={{ padding: 16 }}>{children}</main>
    </>
  );
}
