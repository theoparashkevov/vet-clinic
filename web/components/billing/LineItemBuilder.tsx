"use client";

import { useState } from "react";
import {
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import type { ServiceType, InvoiceItem } from "../../lib/billing/types";
import { SERVICE_TYPE_LABELS } from "../../lib/billing/types";

interface LineItemBuilderProps {
  items: Omit<InvoiceItem, "id" | "invoiceId" | "createdAt">[];
  onChange: (items: Omit<InvoiceItem, "id" | "invoiceId" | "createdAt">[]) => void;
  taxRate?: number;
  onTaxRateChange?: (rate: number) => void;
  readOnly?: boolean;
}

const serviceTypes: ServiceType[] = [
  "CONSULTATION",
  "PROCEDURE",
  "MEDICATION",
  "VACCINATION",
  "LAB_TEST",
  "SUPPLY",
  "BOARDING",
  "OTHER",
];

function calculateLineTotal(quantity: number, unitPrice: number): number {
  return Math.round(quantity * unitPrice * 100) / 100;
}

export default function LineItemBuilder({
  items,
  onChange,
  taxRate = 0,
  onTaxRateChange,
  readOnly = false,
}: LineItemBuilderProps) {
  const [newItem, setNewItem] = useState({
    serviceType: "CONSULTATION" as ServiceType,
    description: "",
    quantity: 1,
    unitPrice: 0,
  });

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + taxAmount) * 100) / 100;

  const handleAddItem = () => {
    if (!newItem.description || newItem.unitPrice <= 0) return;

    const item = {
      ...newItem,
      total: calculateLineTotal(newItem.quantity, newItem.unitPrice),
    };

    onChange([...items, item]);
    setNewItem({
      serviceType: "CONSULTATION",
      description: "",
      quantity: 1,
      unitPrice: 0,
    });
  };

  const handleRemoveItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index));
  };

  const handleUpdateItem = (index: number, field: keyof typeof newItem, value: unknown) => {
    const updated = items.map((item, i) => {
      if (i !== index) return item;
      const updatedItem = { ...item, [field]: value };
      if (field === "quantity" || field === "unitPrice") {
        updatedItem.total = calculateLineTotal(
          field === "quantity" ? (value as number) : item.quantity,
          field === "unitPrice" ? (value as number) : item.unitPrice
        );
      }
      return updatedItem;
    });
    onChange(updated);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <Box>
      <TableContainer component={Paper} variant="outlined" sx={{ mb: 2 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Service</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="right">Qty</TableCell>
              <TableCell align="right">Unit Price</TableCell>
              <TableCell align="right">Total</TableCell>
              {!readOnly && <TableCell align="center">Action</TableCell>}
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((item, index) => (
              <TableRow key={index}>
                <TableCell>
                  {readOnly ? (
                    SERVICE_TYPE_LABELS[item.serviceType]
                  ) : (
                    <FormControl size="small" fullWidth>
                      <Select
                        value={item.serviceType}
                        onChange={(e) =>
                          handleUpdateItem(index, "serviceType", e.target.value)
                        }
                        displayEmpty
                      >
                        {serviceTypes.map((type) => (
                          <MenuItem key={type} value={type}>
                            {SERVICE_TYPE_LABELS[type]}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </TableCell>
                <TableCell>
                  {readOnly ? (
                    item.description
                  ) : (
                    <TextField
                      size="small"
                      value={item.description}
                      onChange={(e) =>
                        handleUpdateItem(index, "description", e.target.value)
                      }
                      fullWidth
                      placeholder="Description"
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {readOnly ? (
                    item.quantity
                  ) : (
                    <TextField
                      size="small"
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        handleUpdateItem(index, "quantity", parseFloat(e.target.value) || 0)
                      }
                      inputProps={{ min: 0.01, step: 0.01 }}
                      sx={{ width: 80 }}
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  {readOnly ? (
                    formatCurrency(item.unitPrice)
                  ) : (
                    <TextField
                      size="small"
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) =>
                        handleUpdateItem(index, "unitPrice", parseFloat(e.target.value) || 0)
                      }
                      inputProps={{ min: 0, step: 0.01 }}
                      sx={{ width: 100 }}
                    />
                  )}
                </TableCell>
                <TableCell align="right">
                  <Typography fontWeight={600}>
                    {formatCurrency(item.total)}
                  </Typography>
                </TableCell>
                {!readOnly && (
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleRemoveItem(index)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                )}
              </TableRow>
            ))}
            {!readOnly && (
              <TableRow>
                <TableCell>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={newItem.serviceType}
                      onChange={(e) =>
                        setNewItem({ ...newItem, serviceType: e.target.value as ServiceType })
                      }
                    >
                      {serviceTypes.map((type) => (
                        <MenuItem key={type} value={type}>
                          {SERVICE_TYPE_LABELS[type]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell>
                  <TextField
                    size="small"
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                    fullWidth
                    placeholder="Description"
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={newItem.quantity}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        quantity: parseFloat(e.target.value) || 0,
                      })
                    }
                    inputProps={{ min: 0.01, step: 0.01 }}
                    sx={{ width: 80 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <TextField
                    size="small"
                    type="number"
                    value={newItem.unitPrice}
                    onChange={(e) =>
                      setNewItem({
                        ...newItem,
                        unitPrice: parseFloat(e.target.value) || 0,
                      })
                    }
                    inputProps={{ min: 0, step: 0.01 }}
                    sx={{ width: 100 }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography color="text.secondary">
                    {formatCurrency(
                      calculateLineTotal(newItem.quantity, newItem.unitPrice)
                    )}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleAddItem}
                    disabled={!newItem.description || newItem.unitPrice <= 0}
                  >
                    Add
                  </Button>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Grid container spacing={2} justifyContent="flex-end">
        <Grid item xs={12} md={6}>
          {!readOnly && onTaxRateChange && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                Tax Rate:
              </Typography>
              <TextField
                size="small"
                type="number"
                value={taxRate * 100}
                onChange={(e) => onTaxRateChange(parseFloat(e.target.value) / 100 || 0)}
                inputProps={{ min: 0, max: 100, step: 0.01 }}
                sx={{ width: 100 }}
                InputProps={{ endAdornment: "%" }}
              />
            </Box>
          )}
        </Grid>
        <Grid item xs={12} md={6}>
          <Box sx={{ textAlign: "right" }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography color="text.secondary">Subtotal:</Typography>
              <Typography>{formatCurrency(subtotal)}</Typography>
            </Box>
            {taxRate > 0 && (
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                <Typography color="text.secondary">
                  Tax ({(taxRate * 100).toFixed(2)}%):
                </Typography>
                <Typography>{formatCurrency(taxAmount)}</Typography>
              </Box>
            )}
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                pt: 1,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" fontWeight={700}>
                Total:
              </Typography>
              <Typography variant="h6" fontWeight={700} color="primary">
                {formatCurrency(total)}
              </Typography>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
