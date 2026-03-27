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
import AddIcon from "@mui/icons-material/Add";
import PageHeader from "../../components/PageHeader";
import EmptyState from "../../components/EmptyState";
import ErrorState from "../../components/ErrorState";
import TableSkeleton from "../../components/TableSkeleton";
import Paginator from "../../components/Paginator";
import CreateUserDialog from "../../components/CreateUserDialog";
import EditUserDialog from "../../components/EditUserDialog";
import PasswordResetDialog from "../../components/PasswordResetDialog";
import DeleteUserDialog from "../../components/DeleteUserDialog";
import { apiJson, AuthError } from "../../lib/api";

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type PaginationMeta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
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
  const [meta, setMeta] = useState<PaginationMeta>({ total: 0, page: 1, limit: 10, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const loadUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiJson<{ data: User[]; meta: PaginationMeta }>(
        `/v1/users?page=${page}&limit=10`
      );
      setUsers(response.data);
      setMeta(response.meta);
    } catch (e: unknown) {
      if (e instanceof AuthError) return;
      setError(e instanceof Error ? e.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(1);
  }, [loadUsers]);

  const handlePageChange = (page: number) => {
    loadUsers(page);
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setEditOpen(true);
  };

  const handleResetPassword = (user: User) => {
    setSelectedUser(user);
    setResetOpen(true);
  };

  const handleDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteOpen(true);
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        subtitle="Manage clinic staff and administrator accounts"
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
            Add User
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
          onRetry={() => loadUsers(meta.page)}
        />
      ) : users.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Add your first user to get started."
          action={
            <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCreateOpen(true)}>
              Add User
            </Button>
          }
        />
      ) : (
        <>
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
                        <IconButton size="small" onClick={() => handleEdit(user)} title="Edit">
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleResetPassword(user)}
                          title="Reset Password"
                        >
                          <LockResetIcon />
                        </IconButton>
                        <IconButton size="small" onClick={() => handleDelete(user)} title="Delete">
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
          <Paginator meta={meta} onPageChange={handlePageChange} />
        </>
      )}

      <CreateUserDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => loadUsers(1)}
      />

      <EditUserDialog
        user={selectedUser}
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onUpdated={() => loadUsers(meta.page)}
      />

      <PasswordResetDialog
        user={selectedUser}
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        onReset={() => loadUsers(meta.page)}
      />

      <DeleteUserDialog
        user={selectedUser}
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onDeleted={() => loadUsers(meta.page)}
      />
    </Box>
  );
}
