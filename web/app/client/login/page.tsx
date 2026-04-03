"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import PetsIcon from "@mui/icons-material/Pets";
import { useClientAuth } from "../../../components/ClientAuthProvider";

export default function ClientLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/client";
  
  const { login, isAuthenticated, loading } = useClientAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.replace(next);
    }
  }, [isAuthenticated, loading, next, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await login(email, password);
      router.replace(next);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
        px: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            width: "100%",
            p: { xs: 3, sm: 5 },
            borderRadius: 4,
            boxShadow: "0 8px 32px rgba(139, 90, 43, 0.12)",
            background: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(139, 90, 43, 0.08)",
          }}
        >
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              sx={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #E8843C 0%, #D46622 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 16px",
                boxShadow: "0 4px 16px rgba(232, 132, 60, 0.3)",
              }}
            >
              <PetsIcon sx={{ fontSize: 40, color: "white" }} />
            </Box>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 700,
                color: "#5D4037",
                mb: 1,
                letterSpacing: "-0.02em",
              }}
            >
              Welcome Back
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: "#8D6E63",
                maxWidth: 300,
                mx: "auto",
              }}
            >
              Sign in to view your pets health records and appointments
            </Typography>
          </Box>

          {error && (
            <Alert
              severity="error"
              sx={{
                mb: 3,
                borderRadius: 2,
                backgroundColor: "rgba(211, 47, 47, 0.08)",
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2.5,
            }}
          >
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              fullWidth
              autoComplete="email"
              autoFocus
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  backgroundColor: "rgba(139, 90, 43, 0.02)",
                },
              }}
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              fullWidth
              autoComplete="current-password"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2.5,
                  backgroundColor: "rgba(139, 90, 43, 0.02)",
                },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              size="large"
              disabled={loading || submitting}
              sx={{
                mt: 1,
                py: 1.5,
                borderRadius: 3,
                background: "linear-gradient(135deg, #E8843C 0%, #D46622 100%)",
                boxShadow: "0 4px 16px rgba(232, 132, 60, 0.35)",
                textTransform: "none",
                fontSize: "1.05rem",
                fontWeight: 600,
                "&:hover": {
                  background: "linear-gradient(135deg, #D46622 0%, #C15518 100%)",
                  boxShadow: "0 6px 20px rgba(232, 132, 60, 0.45)",
                },
              }}
            >
              {submitting ? (
                <>
                  <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                  Signing in...
                </>
              ) : (
                "Sign In to My Account"
              )}
            </Button>
          </Box>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography
              variant="body2"
              sx={{
                color: "#8D6E63",
                mb: 2,
              }}
            >
              Dont have an account?
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#5D4037",
                fontWeight: 500,
              }}
            >
              Contact the clinic to set up your client portal access
            </Typography>
          </Box>
        </Paper>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            textAlign: "center",
            mt: 3,
            color: "rgba(93, 64, 55, 0.6)",
          }}
        >
          VetClinic Client Portal
        </Typography>
      </Container>
    </Box>
  );
}
