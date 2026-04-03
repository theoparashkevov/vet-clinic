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
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import WarningIcon from "@mui/icons-material/Warning";
import ReceiptIcon from "@mui/icons-material/Receipt";
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
    primary: { bg: "rgba(31, 111, 120, 0.1)", icon: "primary.main" },
    success: { bg: "rgba(46, 125, 50, 0.1)", icon: "success.main" },
    warning: { bg: "rgba(237, 108, 2, 0.1)", icon: "warning.main" },
    error: { bg: "rgba(211, 47, 47, 0.1)", icon: "error.main" },
    info: { bg: "rgba(2, 136, 209, 0.1)", icon: "info.main" },
  };

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
            {trend && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mt: 1 }}>
                {trend.isPositive ? (
                  <TrendingUpIcon fontSize="small" color="success" />
                ) : (
                  <TrendingDownIcon fontSize="small" color="error" />
                )}
                <Typography
                  variant="caption"
                  color={trend.isPositive ? "success.main" : "error.main"}
                >
                  {trend.isPositive ? "+" : ""}
                  {trend.value}%
                </Typography>
              </Box>
            )}
          </Box>
          <Box
            sx={{
              p: 1.5,
              borderRadius: 2,
              backgroundColor: colorMap[color].bg,
            }}
          >
            <Icon sx={{ color: colorMap[color].icon, fontSize: 28 }} />
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
        // In a real implementation, these would be actual API calls
        // For now, using mock data
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

        // Simulate API delay
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

      {/* KPI Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          {loading ? (
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
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
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
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
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
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
            <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 2 }} />
          ) : (
            <KPICard
              title="Today's Payments"
              value={formatCurrency(data?.todayPayments || 0)}
              subtitle="Payments received today"
              icon={TrendingUpIcon}
              color="info"
            />
          )}
        </Grid>
      </Grid>

      {/* Revenue Chart */}
      <Box sx={{ mb: 3 }}>
        {loading ? (
          <Skeleton variant="rectangular" height={400} sx={{ borderRadius: 2 }} />
        ) : (
          <RevenueChart
            data={data?.revenueReport.breakdown || []}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
          />
        )}
      </Box>

      {/* Outstanding Invoices & Recent Payments */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 2,
                }}
              >
                <Typography variant="h6" fontWeight={600}>
                  Outstanding Invoices
                </Typography>
                <Button
                  size="small"
                  component={Link}
                  href="/admin/billing/invoices?status=SENT"
                >
                  View All
                </Button>
              </Box>
              {loading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                <List>
                  {data?.outstandingInvoices.slice(0, 5).map((invoice, index) => (
                    <Box key={invoice.id}>
                      <ListItem
                        sx={{ px: 0 }}
                        secondaryAction={
                          <Typography variant="body2" fontWeight={600}>
                            {formatCurrency(invoice.balanceDue)}
                          </Typography>
                        }
                      >
                        <ListItemText
                          primary={
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                              <Typography variant="body2" fontWeight={600}>
                                {invoice.invoiceNumber}
                              </Typography>
                              <InvoiceStatusBadge status={invoice.status} size="small" />
                            </Box>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {invoice.patient.name} • Due {formatDate(invoice.dueDate)}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < (data?.outstandingInvoices.length || 0) - 1 && <Divider />}
                    </Box>
                  ))}
                </List>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Recent Payments
              </Typography>
              {loading ? (
                <Skeleton variant="rectangular" height={200} />
              ) : (
                <List>
                  {data?.recentPayments.map((payment, index) => (
                    <Box key={payment.id}>
                      <ListItem
                        sx={{ px: 0 }}
                        secondaryAction={
                          <Typography variant="body2" fontWeight={600} color="success.main">
                            +{formatCurrency(payment.amount)}
                          </Typography>
                        }
                      >
                        <ListItemText
                          primary={
                            <Typography variant="body2" fontWeight={600}>
                              {payment.invoiceNumber}
                            </Typography>
                          }
                          secondary={
                            <Typography variant="caption" color="text.secondary">
                              {payment.patientName} • {payment.method.replace("_", " ")} •{" "}
                              {formatDate(payment.createdAt)}
                            </Typography>
                          }
                        />
                      </ListItem>
                      {index < (data?.recentPayments.length || 0) - 1 && <Divider />}
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
