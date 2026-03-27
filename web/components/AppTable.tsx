"use client";

import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { ReactNode } from "react";
import TableSkeleton from "./TableSkeleton";
import EmptyState from "./EmptyState";

type Props<T> = {
  headers: string[];
  rows: T[];
  renderRow: (row: T, index: number) => ReactNode;
  loading?: boolean;
  emptyState?: {
    title: string;
    description?: string;
    action?: ReactNode;
  };
  onRowClick?: (row: T) => void;
  keyExtractor: (row: T) => string;
};

export default function AppTable<T>({
  headers,
  rows,
  renderRow,
  loading = false,
  emptyState,
  onRowClick,
  keyExtractor,
}: Props<T>) {
  if (loading) {
    return <TableSkeleton columns={headers.length} headers={headers} />;
  }

  if (rows.length === 0 && emptyState) {
    return (
      <EmptyState
        title={emptyState.title}
        description={emptyState.description}
        action={emptyState.action}
      />
    );
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {headers.map((header) => (
              <TableCell key={header}>{header}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={keyExtractor(row)}
              hover={!!onRowClick}
              onClick={() => onRowClick?.(row)}
              sx={onRowClick ? { cursor: "pointer" } : undefined}
            >
              {renderRow(row, index)}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
