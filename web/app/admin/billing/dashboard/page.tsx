"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Divider,
  Skeleton,
  Avatar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WarningIcon from "@mui/icons-material/Warning";
import ReceiptIcon from "@mui/icons-material/Receipt";
import PaymentIcon from "@mui/icons-material/Payment";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import Link from "next/link";
import { apiJson } from "../../../../lib/api";
import type { Invoice, RevenueReport } from "../../../../lib/billing/types";
import RevenueChart from "../../../../components/billing/RevenueChart";
import InvoiceStatusBadge from "../../../../components/billing/InvoiceStatusBadge";
import PageHeader from "../../../../components/PageHeader";

interface DashboardData {
  todayRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  todayPayments: number;
  revenueReport: RevenueReport;
  outstandingInvoices: Invoice[];
  recentPayments: {
    id: string;
    amount: number;
    method: string;
    invoiceNumber: string;
    patientName: string;
    createdAt: string;
  }[];
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend,
}: {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: "primary" | "success" | "warning" | "error" | "info";
  trend?: { value: number; isPositive: boolean };
}) {
  const colorMap = {
    primary: { bg: "rgba(13, 115, 119, 0.08)", icon: "#0D7377", border: "rgba(13, 115, 119, 0.15)" },
    success: { bg: "rgba(5, 150, 105, 0.08)", icon: "#059669", border: "rgba(5, 150, 105, 0.15)" },
    warning: { bg: "rgba(217, 119, 6, 0.08)", icon: "#D97706", border: "rgba(217, 119, 6, 0.15)" },
    error: { bg: "rgba(220, 38, 38, 0.08)", icon: "#DC2626", border: "rgba(220, 38, 38, 0.15)" },
    info: { bg: "rgba(2, 132, 199, 0.08)", icon: "#0284C7", border: "rgba(2, 132, 199, 0.15)" },
  };

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 4,
        border: `1px solid ${colorMap[color].border}`,
        transition: "all 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              sx={{
                color: "#57534E",
                fontWeight: 500,
                mb: 1,
                letterSpacing: "0.01em",
              }}
            >
              {title}
            </Typography>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                color: "#1C1917",
                letterSpacing: "-0.02em",
                mb: 0.5,
              }}
            >
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: "#78716C", fontWeight: 500 }}>
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 1.5 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.25,
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    backgroundColor: trend.isPositive ? "rgba(5, 150, 105, 0.1)" : "rgba(220, 38, 38, 0.1)",
                  }}
                >
                  {trend.isPositive ? (
                    <TrendingUpIcon sx={{ fontSize: 14, color: "#059669" }} />
                  ) : (
                    <TrendingDownIcon sx={{ fontSize: 14, color: "#DC2626" }} />
                  )}
                  <Typography
                    variant="caption"
                    sx={{
                      fontWeight: 600,
                      color: trend.isPositive ? "#059669" : "#DC2626",
                    }}
                  >
                    {trend.isPositive ? "+" : ""}
                    {trend.value}%
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ color: "#A8A29E" }}>
                  vs last week
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              backgroundColor: colorMap[color].bg,
              border: `1px solid ${colorMap[color].border}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Icon sx={{ color: colorMap[color].icon, fontSize: 26 }} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function BillingDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("week");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const mockData: DashboardData = {
          todayRevenue: 1250.0,
          outstandingAmount: 8750.5,
          overdueAmount: 2100.0,
          todayPayments: 850.0,
          revenueReport: {
            totalRevenue: 45000.0,
            totalCollected: 38000.0,
            totalOutstanding: 7000.0,
            breakdown: [
              { label: "Mon", revenue: 1200, collected: 1000 },
              { label: "Tue", revenue: 1500, collected: 1200 },
              { label: "Wed", revenue: 1800, collected: 1500 },
              { label: "Thu", revenue: 1400, collected: 1100 },
              { label: "Fri", revenue: 2000, collected: 1800 },
              { label: "Sat", revenue: 800, collected: 600 },
              { label: "Sun", revenue: 500, collected: 400 },
            ],
          },
          outstandingInvoices: [
            {
              id: "1",
              invoiceNumber: "INV-2024-001",
              patientId: "p1",
              patient: { id: "p1", name: "Max", species: "Dog", breed: "Golden Retriever" },
              ownerId: "o1",
              owner: { id: "o1", name: "John Smith", email: "john@example.com" },
              issueDate: "2024-01-15",
              dueDate: "2024-02-15",
              status: "OVERDUE",
              subtotal: 250.0,
              taxRate: 0.08,
              taxAmount: 20.0,
              total: 270.0,
              amountPaid: 0,
              balanceDue: 270.0,
              items: [],
              payments: [],
              createdAt: "2024-01-15",
              updatedAt: "2024-01-15",
              createdById: "u1",
              createdBy: { id: "u1", name: "Admin" },
            },
            {
              id: "2",
              invoiceNumber: "INV-2024-002",
              patientId: "p2",
              patient: { id: "p2", name: "Luna", species: "Cat", breed: "Siamese" },
              ownerId: "o2",
              owner: { id: "o2", name: "Jane Doe", email: "jane@example.com" },
              issueDate: "2024-01-20",
              dueDate: "2024-02-20",
              status: "SENT",
              subtotal: 150.0,
              taxRate: 0.08,
              taxAmount: 12.0,
              total: 162.0,
              amountPaid: 0,
              balanceDue: 162.0,
              items: [],
              payments: [],
              createdAt: "2024-01-20",
              updatedAt: "2024-01-20",
              createdById: "u1",
              createdBy: { id: "u1", name: "Admin" },
            },
          ],
          recentPayments: [
            {
              id: "pay1",
              amount: 150.0,
              method: "CREDIT_CARD",
              invoiceNumber: "INV-2024-003",
              patientName: "Bella",
              createdAt: "2024-01-25T10:30:00Z",
            },
            {
              id: "pay2",
              amount: 200.0,
              method: "CASH",
              invoiceNumber: "INV-2024-004",
              patientName: "Charlie",
              createdAt: "2024-01-25T09:15:00Z",
            },
          ],
        };

        await new Promise((resolve) => setTimeout(resolve, 500));
        setData(mockData);
      } catch (err) {
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const actions = (
    <Button
      variant="contained"
      startIcon={<AddIcon />}
      component={Link}
      href="/admin/billing/invoices/new"
      sx={{
        backgroundColor: "#0D7377",
        "&:hover": {
          backgroundColor: "#0A5A5D",
        },
      }}
    >
      Create Invoice
    </Button>
  );

  return (
    <Box>
      <PageHeader
        title="Billing Dashboard"
        subtitle="Overview of revenue, outstanding invoices, and recent payments"
        actions={actions}
      />

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
          ) : (
            <KPICard
              title="Today's Revenue"
              value={formatCurrency(data?.todayRevenue || 0)}
              subtitle="From completed payments"
              icon={AttachMoneyIcon}
              color="success"
              trend={{ value: 12, isPositive: true }}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
          ) : (
            <KPICard
              title="Outstanding"
              value={formatCurrency(data?.outstandingAmount || 0)}
              subtitle="Unpaid invoices"
              icon={ReceiptIcon}
              color="warning"
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
          ) : (
            <KPICard
              title="Overdue"
              value={formatCurrency(data?.overdueAmount || 0)}
              subtitle="Past due date"
              icon={WarningIcon}
              color="error"
              trend={{ value: 5, isPositive: false }}
            />
          )}
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={140} sx={{ borderRadius: 4 }} />
          ) : (
            <KPICard
              title="Today's Payments"
              value={formatCurrency(data?.todayPayments || 0)}
              subtitle="Payments received today"
              icon={PaymentIcon}
              color="info"
            />
          )}
        </Grid>
      </Grid>

      <Box sx={{ mb: 4 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 4 }} />
        ) : (
          <RevenueChart
            data={data?.revenueReport.breakdown || []}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
          />
        )}
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Avatar
                    sx={{
                      bgcolor: "rgba(217, 119, 6, 0.1)",
                      color: "#D97706",
                      width: 40,
                      height: 40,
                    }}
                  >
                    <ReceiptIcon fontSize="small" />
                  </Avatar>
                  <Typography variant="h6" fontWeight={700} color="#1C1917">
                    Outstanding Invoices
                  </Typography>
                </Box>
                <Button
                  size="small"
                  component={Link}
                  href="/admin/billing/invoices?status=SENT"
                  sx={{
                    color: "#0D7377",
                    fontWeight: 600,
                    "&:hover": {
                      backgroundColor: "rgba(13, 115, 119, 0.08)",
                    },
                  }}
                >
                  View All
                </Button>
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              ) : (
                <List sx={{ p: 0 }}>
                  {data?.outstandingInvoices.slice(0, 5).map((invoice, index) => (
                    <Box key={invoice.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 2,
                          borderRadius: 2,
                          transition: "background-color 0.15s ease",
                          "&:hover": {
                            backgroundColor: "#FAFAF9",
                          },
                        }}
                        secondaryAction={
                          <Typography variant="body2" fontWeight={700} color="#1C1917">
                            {formatCurrency(invoice.balanceDue)}
                          </Typography>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                              <Typography variant="body2" fontWeight={600} color="#1C1917">
                                {invoice.invoiceNumber}
                              </Typography>
                              <InvoiceStatusBadge status={invoice.status} size="small" />
                            </Box>
                          }
                          secondary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="caption" color="#78716C">
                                {invoice.patient.name}
                              </Typography>
                              <Box
                                component="span"
                                sx={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: "50%",
                                  backgroundColor: "#D6D3D1",
                                }}
                              />
                              <Typography variant="caption" color="#A8A29E">
                                Due {formatDate(invoice.dueDate)}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < (data?.outstandingInvoices.length || 0) - 1 && (
                        <Divider sx={{ borderColor: "#F5F5F4" }} />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ borderRadius: 4, height: "100%" }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: "rgba(5, 150, 105, 0.1)",
                    color: "#059669",
                    width: 40,
                    height: 40,
                  }}
                >
                  <PaymentIcon fontSize="small" />
                </Avatar>
                <Typography variant="h6" fontWeight={700} color="#1C1917">
                  Recent Payments
                </Typography>
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={200} sx={{ borderRadius: 2 }} />
              ) : (
                <List sx={{ p: 0 }}>
                  {data?.recentPayments.map((payment, index) => (
                    <Box key={payment.id}>
                      <ListItem
                        sx={{
                          px: 0,
                          py: 2,
                          borderRadius: 2,
                          transition: "background-color 0.15s ease",
                          "&:hover": {
                            backgroundColor: "#FAFAF9",
                          },
                        }}
                        secondaryAction={
                          <Box sx={{ textAlign: "right" }}>
                            <Typography variant="body2" fontWeight={700} color="#059669">
                              +{formatCurrency(payment.amount)}
                            </Typography>
                            <Typography variant="caption" color="#A8A29E">
                              {formatDate(payment.createdAt)}
                            </Typography>
                          </Box>
                        }
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600} color="#1C1917">
                              {payment.invoiceNumber}
                            </Typography>
                          }
                          secondary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="caption" color="#78716C">
                                {payment.patientName}
                              </Typography>
                              <Box
                                component="span"
                                sx={{
                                  width: 4,
                                  height: 4,
                                  borderRadius: "50%",
                                  backgroundColor: "#D6D3D1",
                                }}
                              />
                              <Typography variant="caption" color="#A8A29E">
                                {payment.method.replace("_", " ")}
                              </Typography>
                            </Box>
                          }
                        />
                      </ListItem>
                      {index < (data?.recentPayments.length || 0) - 1 && (
                        <Divider sx={{ borderColor: "#F5F5F4" }} />
                      )}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
