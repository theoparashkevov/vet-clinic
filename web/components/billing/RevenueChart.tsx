"use client";

import { useMemo } from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RevenueChartProps {
  data: {
    label: string;
    revenue: number;
    collected: number;
  }[];
  groupBy: "day" | "week" | "month";
  onGroupByChange: (value: "day" | "week" | "month") => void;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RevenueChart({
  data,
  groupBy,
  onGroupByChange,
}: RevenueChartProps) {
  const chartData = useMemo(() => {
    return data.map((item) => ({
      ...item,
      outstanding: item.revenue - item.collected,
    }));
  }, [data]);

  const handleGroupByChange = (
    _event: React.MouseEvent<HTMLElement>,
    value: "day" | "week" | "month"
  ) => {
    if (value) {
      onGroupByChange(value);
    }
  };

  return (
    <Paper
      sx={{
        p: 3,
        borderRadius: 4,
        border: "1px solid #E7E5E4",
        boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.03)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box>
          <Typography variant="h6" fontWeight={700} color="#1C1917">
            Revenue Overview
          </Typography>
          <Typography variant="body2" color="#78716C" sx={{ mt: 0.5 }}>
            Track your clinic's financial performance
          </Typography>
        </Box>
        <ToggleButtonGroup
          value={groupBy}
          exclusive
          onChange={handleGroupByChange}
          size="small"
          sx={{
            backgroundColor: "#F5F5F4",
            p: 0.5,
            borderRadius: 2,
            "& .MuiToggleButton-root": {
              border: "none",
              borderRadius: 1.5,
              px: 2,
              py: 0.75,
              fontWeight: 600,
              fontSize: "0.8125rem",
              color: "#57534E",
              "&.Mui-selected": {
                backgroundColor: "#FFFFFF",
                color: "#0D7377",
                boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
              },
            },
          }}
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box sx={{ height: 320 }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#E7E5E4"
            />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 12, fill: "#78716C" }}
              tickLine={false}
              axisLine={{ stroke: "#E7E5E4" }}
            />
            <YAxis
              tickFormatter={formatCurrency}
              tick={{ fontSize: 12, fill: "#78716C" }}
              tickLine={false}
              axisLine={false}
              width={60}
            />
            <Tooltip
              formatter={(value) => formatCurrency(Number(value) || 0)}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #E7E5E4",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
                backgroundColor: "#FFFFFF",
              }}
              labelStyle={{
                color: "#1C1917",
                fontWeight: 600,
                marginBottom: 8,
              }}
            />
            <Legend
              wrapperStyle={{
                paddingTop: 20,
              }}
              iconType="circle"
            />
            <Bar
              dataKey="collected"
              name="Collected"
              stackId="a"
              fill="#059669"
              radius={[0, 0, 4, 4]}
            />
            <Bar
              dataKey="outstanding"
              name="Outstanding"
              stackId="a"
              fill="#D97706"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Paper>
  );
}
