"use client";

import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LockResetIcon from "@mui/icons-material/LockReset";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import TableSkeleton from "../../components/TableSkeleton";
import { apiJson, AuthError } from "../../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

const USER_ROLES = [
  { value: "doctor", label: "Doctor", color: "primary" as const },
  { value: "staff", label: "Staff", color: "default" as const },
  { value: "admin", label: "Admin", color: "secondary" as const },
];

function getRoleConfig(role: string) {
  return USER_ROLES.find((r) => r.value === role) ?? { label: role, color: "default" as const };
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiJson<User[]>("/v1/users");
      setUsers(data);
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Manage clinic staff and administrator accounts"
        actions={
          <Button variant="contained" disabled>
            Add User (Coming Soon)
          </Button>
        }
      />

      {loading ? (
        <TableSkeleton columns={4} headers={["Name", "Email", "Role", "Actions"]} />
      ) : error ? (
        <ErrorState
          title="Couldn't load users"
          message="Please check your connection and try again."
          details={error}
          onRetry={loadUsers}
        />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Add your first user to get started."
          action={
            <Button variant="contained" disabled>
              Add User
            </Button>
          }
        />
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const roleConfig = getRoleConfig(user.role);
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Typography fontWeight={500}>{user.name}</Typography>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Chip label={roleConfig.label} size="small" color={roleConfig.color} />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" disabled title="Edit (Coming Soon)">
                        <EditIcon />
                      </IconButton>
                      <IconButton size="small" disabled title="Reset Password (Coming Soon)">
                        <LockResetIcon />
                      </IconButton>
                      <IconButton size="small" disabled title="Delete (Coming Soon)">
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
}
