"use client";

import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";

type Props = {
  columns: number;
  rows?: number;
  headers?: string[];
};

export default function TableSkeleton({ columns, rows = 6, headers }: Props) {
  const headerCells = headers?.length ? headers : Array.from({ length: columns }, () => "");

  return (
    <TableContainer component={Paper} aria-busy="true" aria-label="Loading">
      <Table>
        <TableHead>
          <TableRow>
            {headerCells.slice(0, columns).map((h, idx) => (
              <TableCell key={idx}>{h || <Skeleton width={80} />}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from({ length: rows }).map((_, r) => (
            <TableRow key={r}>
              {Array.from({ length: columns }).map((__, c) => (
                <TableCell key={c}>
                  <Skeleton variant="text" width={c === 0 ? "60%" : "80%"} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
