"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import {
  ClientAuthProvider,
  useClientAuth,
} from "../../components/ClientAuthProvider";
import ClientLayoutWrapper from "../../components/client/ClientNav";

function ClientAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useClientAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated && pathname !== "/client/login") {
      router.push(`/client/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)",
          gap: 2,
        }}
      >
        <CircularProgress
          size={40}
          sx={{
            color: "#E8843C",
          }}
        />
        <Typography sx={{ color: "#8D6E63" }}>Loading your portal...</Typography>
      </Box>
    );
  }

  if (!isAuthenticated && pathname !== "/client/login") {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)",
        }}
      >
        <CircularProgress size={32} sx={{ color: "#E8843C" }} />
      </Box>
    );
  }

  if (pathname === "/client/login") {
    return <>{children}</>;
  }

  return <ClientLayoutWrapper>{children}</ClientLayoutWrapper>;
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClientAuthProvider>
      <ClientAuthGuard>{children}</ClientAuthGuard>
    </ClientAuthProvider>
  );
}
