"use client";

import type { ReactNode } from "react";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

type Props = {
  title?: string;
  message?: string;
  details?: string;
  action?: ReactNode;
  onRetry?: () => void;
};

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load this data.",
  details,
  action,
  onRetry,
}: Props) {
  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack spacing={2}>
        <Alert severity="error" variant="outlined">
          <AlertTitle>{title}</AlertTitle>
          <Typography variant="body2">{message}</Typography>
          {details ? (
            <Box component="pre" sx={{ mt: 1.5, mb: 0, whiteSpace: "pre-wrap", fontSize: 12 }}>
              {details}
            </Box>
          ) : null}
        </Alert>

        {action || onRetry ? (
          <Stack direction="row" spacing={1}>
            {onRetry ? (
              <Button variant="contained" onClick={onRetry}>
                Retry
              </Button>
            ) : null}
            {action}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
