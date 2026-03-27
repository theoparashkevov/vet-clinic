"use client";

import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export default function FullPageLoading({ label = "Loading..." }: { label?: string }) {
  return (
    <Backdrop
      open
      sx={(t) => ({
        zIndex: t.zIndex.modal + 1,
        color: t.palette.text.primary,
        backgroundColor: "rgba(246, 245, 242, 0.75)",
      })}
    >
      <Paper elevation={0} sx={{ px: 3, py: 2, borderRadius: 3 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <CircularProgress size={20} />
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {label}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Backdrop>
  );
}
