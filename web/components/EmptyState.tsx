"use client";

import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

type Props = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export default function EmptyState({ title, description, action }: Props) {
  return (
    <Paper sx={{ p: 4, borderRadius: 3 }}>
      <Box sx={{ maxWidth: 520 }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        {description ? (
          <Typography color="text.secondary" sx={{ mb: action ? 2 : 0 }}>
            {description}
          </Typography>
        ) : null}
        {action ? <Box sx={{ mt: 1 }}>{action}</Box> : null}
      </Box>
    </Paper>
  );
}
