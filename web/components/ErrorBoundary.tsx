"use client";

import { Component, ErrorInfo, ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import RefreshIcon from "@mui/icons-material/Refresh";
import HomeIcon from "@mui/icons-material/Home";
import { useRouter } from "next/navigation";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Global Error Boundary
 * Catches React errors and displays a user-friendly error page
 * instead of crashing the entire application
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    
    this.setState({ error, errorInfo });
    
    // In production, you would send to error tracking service (Sentry, etc.)
    // Example: Sentry.captureException(error, { extra: errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

/**
 * Error Fallback Component
 * Displays when an error is caught
 */
function ErrorFallback({ 
  error, 
  onReset 
}: { 
  error: Error | null; 
  onReset: () => void;
}) {
  const router = useRouter();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
        background: "linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)",
      }}
    >
      <Paper
        elevation={0}
        sx={{
          maxWidth: 600,
          width: "100%",
          p: { xs: 3, sm: 5 },
          borderRadius: 4,
          boxShadow: "0 8px 32px rgba(139, 90, 43, 0.12)",
          textAlign: "center",
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            color: "#5D4037",
            mb: 2,
          }}
        >
          Oops! Something went wrong
        </Typography>

        <Typography
          variant="body1"
          sx={{
            color: "#8D6E63",
            mb: 3,
            maxWidth: 400,
            mx: "auto",
          }}
        >
          We&apos;re sorry, but something unexpected happened. Our team has been notified.
        </Typography>

        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            textAlign: "left",
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
            Error: {error?.name || "Unknown Error"}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
            {error?.message || "An unexpected error occurred"}
          </Typography>
        </Alert>

        <Box sx={{ display: "flex", gap: 2, justifyContent: "center", flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={onReset}
            sx={{
              borderRadius: 3,
              background: "linear-gradient(135deg, #E8843C 0%, #D46622 100%)",
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Try Again
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<HomeIcon />}
            onClick={() => router.push("/")}
            sx={{
              borderRadius: 3,
              textTransform: "none",
              borderColor: "#8B5A2B",
              color: "#8B5A2B",
            }}
          >
            Go Home
          </Button>
        </Box>

        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 4,
            color: "rgba(93, 64, 55, 0.5)",
          }}
        >
          If this problem persists, please contact support
        </Typography>
      </Paper>
    </Box>
  );
}

/**
 * Section Error Boundary
 * Smaller boundary for specific page sections
 * Prevents entire page crash when one component fails
 */
export function SectionErrorBoundary({ 
  children, 
  sectionName = "this section" 
}: { 
  children: ReactNode; 
  sectionName?: string;
}) {
  return (
    <ErrorBoundary
      fallback={
        <Box sx={{ p: 3, textAlign: "center" }}>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <Typography variant="body2">
              Unable to load {sectionName}. Please try refreshing the page.
            </Typography>
          </Alert>
          <Button
            size="small"
            onClick={() => window.location.reload()}
            sx={{ textTransform: "none" }}
          >
            Refresh Page
          </Button>
        </Box>
      }
    >
      {children}
    </ErrorBoundary>
  );
}
