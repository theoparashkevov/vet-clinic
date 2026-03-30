"use client";

import { useState, useCallback } from "react";
import {
  Box,
  Toolbar,
  Typography,
  Button,
  Checkbox,
  IconButton,
  Tooltip,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Menu,
  MenuItem,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DownloadIcon from "@mui/icons-material/Download";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import CloseIcon from "@mui/icons-material/Close";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";

export interface BulkAction {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: (selectedIds: string[]) => void;
  confirmMessage?: string;
  color?: "primary" | "secondary" | "error" | "warning";
}

interface BulkActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete?: (ids: string[]) => void;
  onExport?: (ids: string[]) => void;
  customActions?: BulkAction[];
  selectedIds: string[];
}

export function BulkActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onExport,
  customActions = [],
  selectedIds,
}: BulkActionsToolbarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleActionClick = (action: BulkAction) => {
    handleMenuClose();
    if (action.confirmMessage) {
      setConfirmAction(action);
    } else {
      action.onClick(selectedIds);
    }
  };

  const handleConfirm = () => {
    if (confirmAction) {
      confirmAction.onClick(selectedIds);
      setConfirmAction(null);
    }
  };

  const allActions: BulkAction[] = [
    ...(onExport
      ? [
          {
            id: "export",
            label: "Export Selected",
            icon: <DownloadIcon />,
            onClick: onExport,
          },
        ]
      : []),
    ...customActions,
    ...(onDelete
      ? [
          {
            id: "delete",
            label: "Delete Selected",
            icon: <DeleteIcon />,
            onClick: onDelete,
            confirmMessage: `Are you sure you want to delete ${selectedCount} selected item${selectedCount === 1 ? "" : "s"}? This action cannot be undone.`,
            color: "error" as const,
          },
        ]
      : []),
  ];

  if (selectedCount === 0) return null;

  return (
    <>
      <Toolbar
        sx={{
          pl: { sm: 2 },
          pr: { xs: 1, sm: 1 },
          bgcolor: "primary.light",
          borderRadius: 1,
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", flex: 1 }}>
          <Typography color="inherit" variant="subtitle1" component="div">
            {selectedCount} selected
          </Typography>
          
          {selectedCount < totalCount && (
            <Chip
              size="small"
              label={`of ${totalCount}`}
              sx={{ ml: 1 }}
              variant="outlined"
            />
          )}
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="Select All">
            <IconButton onClick={onSelectAll} size="small" color="inherit">
              <SelectAllIcon />
            </IconButton>
          </Tooltip>

          <Tooltip title="Deselect All">
            <IconButton onClick={onDeselectAll} size="small" color="inherit">
              <DeselectIcon />
            </IconButton>
          </Tooltip>

          <Divider orientation="vertical" flexItem sx={{ mx: 1 }} />

          {/* Primary Actions */}
          {allActions.slice(0, 2).map((action) => (
            <Button
              key={action.id}
              size="small"
              color={action.color || "inherit"}
              startIcon={action.icon}
              onClick={() => handleActionClick(action)}
            >
              {action.label}
            </Button>
          ))}

          {/* More Actions Menu */}
          {allActions.length > 2 && (
            <>
              <Tooltip title="More Actions">
                <IconButton onClick={handleMenuOpen} size="small" color="inherit">
                  <MoreVertIcon />
                </IconButton>
              </Tooltip>
              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                transformOrigin={{ vertical: "top", horizontal: "right" }}
              >
                {allActions.slice(2).map((action) => (
                  <MenuItem
                    key={action.id}
                    onClick={() => handleActionClick(action)}
                    sx={{ color: action.color === "error" ? "error.main" : undefined }}
                  >
                    {action.icon && (
                      <Box component="span" sx={{ mr: 1, display: "flex" }}>
                        {action.icon}
                      </Box>
                    )}
                    {action.label}
                  </MenuItem>
                ))}
              </Menu>
            </>
          )}

          <Tooltip title="Clear Selection">
            <IconButton onClick={onDeselectAll} size="small" color="inherit">
              <CloseIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>

      {/* Confirmation Dialog */}
      <Dialog open={!!confirmAction} onClose={() => setConfirmAction(null)} maxWidth="sm">
        <DialogTitle>Confirm Action</DialogTitle>
        <DialogContent>
          <Alert severity={confirmAction?.color === "error" ? "error" : "warning"} sx={{ mb: 2 }}>
            {confirmAction?.confirmMessage}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmAction(null)}>Cancel</Button>
          <Button
            onClick={handleConfirm}
            color={confirmAction?.color || "primary"}
            variant="contained"
            autoFocus
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

// Hook for managing bulk selection
export function useBulkSelection<T extends { id: string }>(items: T[]) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const selectAll = useCallback(() => {
    setSelectedIds(items.map((item) => item.id));
  }, [items]);

  const deselectAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const selectRange = useCallback(
    (startId: string, endId: string) => {
      const startIndex = items.findIndex((item) => item.id === startId);
      const endIndex = items.findIndex((item) => item.id === endId);
      
      if (startIndex === -1 || endIndex === -1) return;
      
      const [min, max] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
      const rangeIds = items.slice(min, max + 1).map((item) => item.id);
      
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rangeIds])));
    },
    [items]
  );

  const selectedItems = items.filter((item) => selectedIds.includes(item.id));

  return {
    selectedIds,
    selectedItems,
    selectedCount: selectedIds.length,
    toggleSelection,
    isSelected,
    selectAll,
    deselectAll,
    selectRange,
  };
}

// Component for selectable table rows
interface SelectableRowProps {
  id: string;
  isSelected: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  lastSelectedId?: string | null;
  onShiftClick?: (id: string) => void;
}

export function SelectableRow({
  id,
  isSelected,
  onToggle,
  children,
  lastSelectedId,
  onShiftClick,
}: SelectableRowProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (e.shiftKey && lastSelectedId && onShiftClick) {
      onShiftClick(id);
    } else {
      onToggle(id);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        bgcolor: isSelected ? "primary.light" : "inherit",
        "&:hover": {
          bgcolor: isSelected ? "primary.light" : "action.hover",
        },
        borderRadius: 1,
        transition: "background-color 0.2s",
      }}
      onClick={handleClick}
    >
      <Box sx={{ p: 1, pl: 2 }}>
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(id)}
          onClick={(e) => e.stopPropagation()}
          size="small"
        />
      </Box>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Box>
  );
}

// Component for table header with select all checkbox
interface SelectableHeaderProps {
  totalCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
}

export function SelectableHeader({
  totalCount,
  selectedCount,
  onSelectAll,
  onDeselectAll,
}: SelectableHeaderProps) {
  const isAllSelected = totalCount > 0 && selectedCount === totalCount;
  const isIndeterminate = selectedCount > 0 && selectedCount < totalCount;

  const handleChange = () => {
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  };

  return (
    <Box sx={{ display: "flex", alignItems: "center", p: 1, pl: 2 }}>
      <Checkbox
        checked={isAllSelected}
        indeterminate={isIndeterminate}
        onChange={handleChange}
        size="small"
      />
      <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
        {selectedCount > 0 ? `${selectedCount} selected` : "Select"}
      </Typography>
    </Box>
  );
}
