"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  Alert,
  Stepper,
  Step,
  StepLabel,
} from "@mui/material";
import type { PaymentMethod, Invoice } from "../../lib/billing/types";
import { PAYMENT_METHOD_LABELS } from "../../lib/billing/types";

interface RecordPaymentModalProps {
  open: boolean;
  invoice: Invoice | null;
  onClose: () => void;
  onSubmit: (data: {
    amount: number;
    method: PaymentMethod;
    notes?: string;
  }) => void;
  loading?: boolean;
}

const steps = ["Payment Details", "Confirmation"];

export default function RecordPaymentModal({
  open,
  invoice,
  onClose,
  onSubmit,
  loading = false,
}: RecordPaymentModalProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const balanceDue = invoice?.balanceDue || 0;
  const enteredAmount = parseFloat(amount) || 0;

  const handleNext = () => {
    if (activeStep === 0) {
      if (enteredAmount <= 0) {
        setError("Please enter a valid amount");
        return;
      }
      if (enteredAmount > balanceDue) {
        setError("Amount cannot exceed the balance due");
        return;
      }
      setError(null);
    }
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setActiveStep((prev) => prev - 1);
    setError(null);
  };

  const handleSubmit = () => {
    onSubmit({
      amount: enteredAmount,
      method,
      notes: notes || undefined,
    });
  };

  const handleClose = () => {
    setActiveStep(0);
    setAmount("");
    setMethod("CASH");
    setNotes("");
    setError(null);
    onClose();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const isCreditCard = method === "CREDIT_CARD" || method === "STRIPE";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Record Payment</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 3 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {invoice && (
          <Box sx={{ mb: 3, p: 2, bgcolor: "background.default", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Invoice: {invoice.invoiceNumber}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Patient: {invoice.patient.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Owner: {invoice.owner.name}
            </Typography>
            <Box sx={{ mt: 1, pt: 1, borderTop: "1px solid", borderColor: "divider" }}>
              <Typography variant="h6" color="primary" fontWeight={600}>
                Balance Due: {formatCurrency(balanceDue)}
              </Typography>
            </Box>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {activeStep === 0 && (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              label="Payment Amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              fullWidth
              autoFocus
              inputProps={{ min: 0.01, step: 0.01 }}
              helperText={`Balance due: ${formatCurrency(balanceDue)}`}
            />

            <FormControl fullWidth>
              <InputLabel>Payment Method</InputLabel>
              <Select
                value={method}
                label="Payment Method"
                onChange={(e) => setMethod(e.target.value as PaymentMethod)}
              >
                <MenuItem value="CASH">{PAYMENT_METHOD_LABELS.CASH}</MenuItem>
                <MenuItem value="CHECK">{PAYMENT_METHOD_LABELS.CHECK}</MenuItem>
                <MenuItem value="CREDIT_CARD">{PAYMENT_METHOD_LABELS.CREDIT_CARD}</MenuItem>
                <MenuItem value="DEBIT_CARD">{PAYMENT_METHOD_LABELS.DEBIT_CARD}</MenuItem>
                <MenuItem value="BANK_TRANSFER">{PAYMENT_METHOD_LABELS.BANK_TRANSFER}</MenuItem>
              </Select>
            </FormControl>

            {isCreditCard && (
              <Alert severity="info">
                Credit card payments will be processed through Stripe. Click
                &quot;Next&quot; to proceed to payment processing.
              </Alert>
            )}

            <TextField
              label="Notes / Reference"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder={
                method === "CHECK"
                  ? "Check number, bank name..."
                  : "Optional notes about this payment"
              }
            />
          </Box>
        )}

        {activeStep === 1 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Confirm Payment
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Amount:</Typography>
                <Typography fontWeight={600}>{formatCurrency(enteredAmount)}</Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography color="text.secondary">Method:</Typography>
                <Typography fontWeight={600}>
                  {PAYMENT_METHOD_LABELS[method]}
                </Typography>
              </Box>
              {notes && (
                <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                  <Typography color="text.secondary">Notes:</Typography>
                  <Typography>{notes}</Typography>
                </Box>
              )}
              <Box
                sx={{
                  mt: 1,
                  pt: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <Typography fontWeight={600}>Remaining Balance:</Typography>
                <Typography fontWeight={600}>
                  {formatCurrency(Math.max(0, balanceDue - enteredAmount))}
                </Typography>
              </Box>
            </Box>

            {isCreditCard ? (
              <Alert severity="warning" sx={{ mb: 2 }}>
                You will be redirected to Stripe to complete the payment processing.
              </Alert>
            ) : (
              <Alert severity="info">
                This will record an offline payment. No automatic charge will be made.
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        {activeStep > 0 && (
          <Button onClick={handleBack} disabled={loading}>
            Back
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button onClick={handleNext} variant="contained">
            Next
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            variant="contained"
            color="success"
            disabled={loading}
          >
            {loading ? "Processing..." : isCreditCard ? "Process with Stripe" : "Record Payment"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
