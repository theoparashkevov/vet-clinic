"use client";

import { useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

type WeightRecord = {
  id: string;
  weight: number;
  date: string;
  notes?: string;
};

type Props = {
  records: WeightRecord[];
  idealWeight?: number;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function kgToLbs(kg: number): number {
  return kg * 2.20462;
}

export default function WeightHistoryChart({ records, idealWeight }: Props) {
  const [unit, setUnit] = useState<"kg" | "lbs">("kg");

  if (!records || records.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: "center" }}>
        <Typography color="text.secondary">
          No weight records available
        </Typography>
      </Paper>
    );
  }

  // Sort by date ascending for chart
  const sortedRecords = [...records].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Convert data for chart
  const chartData = sortedRecords.map((record) => ({
    date: formatDate(record.date),
    fullDate: record.date,
    weight: unit === "kg" ? record.weight : kgToLbs(record.weight),
    notes: record.notes,
  }));

  // Calculate statistics
  const currentWeight = sortedRecords[sortedRecords.length - 1].weight;
  const previousWeight =
    sortedRecords.length > 1 ? sortedRecords[sortedRecords.length - 2].weight : currentWeight;
  const weightChange = currentWeight - previousWeight;
  const percentChange = previousWeight !== 0 ? (weightChange / previousWeight) * 100 : 0;

  // Determine if change is significant (>10%)
  const isSignificantChange = Math.abs(percentChange) > 10;

  return (
    <Box>
      {/* Stats Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box>
          <Typography variant="h6" component="span" sx={{ mr: 2 }}>
            Current: {unit === "kg" ? currentWeight.toFixed(1) : kgToLbs(currentWeight).toFixed(1)} {unit}
          </Typography>
          {sortedRecords.length > 1 && (
            <Typography
              variant="body1"
              component="span"
              color={
                isSignificantChange
                  ? "error.main"
                  : weightChange > 0
                  ? "warning.main"
                  : weightChange < 0
                  ? "success.main"
                  : "text.secondary"
              }
              sx={{ fontWeight: isSignificantChange ? 600 : 400 }}
            >
              {weightChange > 0 ? "+" : ""}
              {unit === "kg"
                ? weightChange.toFixed(1)
                : kgToLbs(weightChange).toFixed(1)} {unit}
              {" "}({percentChange > 0 ? "+" : ""}
              {percentChange.toFixed(1)}%)
              {isSignificantChange && " ⚠️"}
            </Typography>
          )}
        </Box>

        <ToggleButtonGroup
          value={unit}
          exclusive
          onChange={(_, value) => value && setUnit(value)}
          size="small"
        >
          <ToggleButton value="kg">kg</ToggleButton>
          <ToggleButton value="lbs">lbs</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Chart */}
      <Paper sx={{ p: 2, height: 300 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              domain={["auto", "auto"]}
              label={{
                value: `Weight (${unit})`,
                angle: -90,
                position: "insideLeft",
                style: { fontSize: 12 },
              }}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <Paper sx={{ p: 1 }}>
                      <Typography variant="caption" display="block" color="text.secondary">
                        {new Date(data.fullDate).toLocaleDateString()}
                      </Typography>
                      <Typography variant="body2" fontWeight={500}>
                        {data.weight.toFixed(1)} {unit}
                      </Typography>
                      {data.notes && (
                        <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                          {data.notes}
                        </Typography>
                      )}
                    </Paper>
                  );
                }
                return null;
              }}
            />
            {idealWeight && (
              <ReferenceLine
                y={unit === "kg" ? idealWeight : kgToLbs(idealWeight)}
                stroke="#4caf50"
                strokeDasharray="5 5"
                label={{
                  value: "Ideal",
                  position: "right",
                  fill: "#4caf50",
                  fontSize: 12,
                }}
              />
            )}
            <Line
              type="monotone"
              dataKey="weight"
              stroke="#1976d2"
              strokeWidth={2}
              dot={{ fill: "#1976d2", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: "#1976d2", strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Paper>

      {isSignificantChange && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          <AlertTitle>Significant Weight Change</AlertTitle>
          This patient has experienced a {Math.abs(percentChange).toFixed(1)}% weight
          change since their last visit. This may warrant further investigation.
        </Alert>
      )}
    </Box>
  );
}
