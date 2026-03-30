"use client";

import { Skeleton, TableCell, TableRow, Box } from "@mui/material";

interface TableSkeletonProps {
  rows?: number;
  columns?: number;
}

export function TableSkeleton({ rows = 5, columns = 4 }: TableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <TableRow key={rowIndex}>
          {Array.from({ length: columns }).map((_, colIndex) => (
            <TableCell key={colIndex}>
              <Skeleton 
                variant="text" 
                animation="wave"
                sx={{ 
                  opacity: 1 - (rowIndex * 0.1),
                  transform: 'none'
                }}
              />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );
}

interface CardSkeletonProps {
  count?: number;
}

export function CardSkeleton({ count = 3 }: CardSkeletonProps) {
  return (
    <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            minWidth: 280,
            flex: "1 1 280px",
          }}
        >
          <Skeleton variant="circular" width={40} height={40} sx={{ mb: 2 }} />
          <Skeleton variant="text" width="60%" sx={{ mb: 1 }} />
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="40%" />
        </Box>
      ))}
    </Box>
  );
}

interface PatientListSkeletonProps {
  count?: number;
}

export function PatientListSkeleton({ count = 5 }: PatientListSkeletonProps) {
  return (
    <Box>
      {Array.from({ length: count }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderBottom: index < count - 1 ? "1px solid" : "none",
            borderColor: "divider",
          }}
        >
          <Skeleton variant="circular" width={40} height={40} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" />
            <Skeleton variant="text" width="25%" />
          </Box>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
    </Box>
  );
}

interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {Array.from({ length: fields }).map((_, index) => (
        <Box key={index}>
          <Skeleton variant="text" width="30%" height={24} sx={{ mb: 0.5 }} />
          <Skeleton variant="rectangular" height={56} sx={{ borderRadius: 1 }} />
        </Box>
      ))}
      <Skeleton variant="rectangular" height={40} width={120} sx={{ borderRadius: 1, mt: 2 }} />
    </Box>
  );
}

export function DashboardStatsSkeleton() {
  return (
    <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 2 }}>
      {Array.from({ length: 4 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 3,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="text" width="50%" />
          </Box>
          <Skeleton variant="text" width="30%" height={40} />
          <Skeleton variant="text" width="60%" />
        </Box>
      ))}
    </Box>
  );
}

export function AppointmentListSkeleton() {
  return (
    <Box>
      {Array.from({ length: 4 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            p: 2,
            borderBottom: index < 3 ? "1px solid" : "none",
            borderColor: "divider",
          }}
        >
          <Box sx={{ minWidth: 60, textAlign: "center" }}>
            <Skeleton variant="text" width={40} />
            <Skeleton variant="text" width={30} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="50%" />
            <Skeleton variant="text" width="30%" />
          </Box>
          <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 5 }} />
        </Box>
      ))}
    </Box>
  );
}

export function LabResultsSkeleton() {
  return (
    <Box>
      {Array.from({ length: 3 }).map((_, index) => (
        <Box
          key={index}
          sx={{
            p: 2,
            mb: 2,
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Box>
              <Skeleton variant="text" width={150} />
              <Skeleton variant="text" width={100} />
            </Box>
            <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 5 }} />
          </Box>
          <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 2 }}>
            {Array.from({ length: 6 }).map((__, colIndex) => (
              <Box key={colIndex}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </Box>
            ))}
          </Box>
        </Box>
      ))}
    </Box>
  );
}
