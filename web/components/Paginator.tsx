"use client";

import Box from "@mui/material/Box";
import Pagination from "@mui/material/Pagination";
import Typography from "@mui/material/Typography";

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type Props = {
  meta: PaginationMeta;
  onPageChange: (page: number) => void;
};

export default function Paginator({ meta, onPageChange }: Props) {
  if (meta.totalPages <= 1) return null;

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        mt: 2,
        flexWrap: "wrap",
        gap: 1,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        Showing {((meta.page - 1) * meta.limit) + 1} - {Math.min(meta.page * meta.limit, meta.total)} of{" "}
        {meta.total} results
      </Typography>
      <Pagination
        count={meta.totalPages}
        page={meta.page}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        size="small"
      />
    </Box>
  );
}
