// src/components/driver_comparison/ComparisonTrendChartRecharts.js
import React, { useState, useMemo, useEffect } from "react";
import { Box, Chip, Stack, Typography, Grid } from "@mui/material";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

const metricGroups = {
  position: {
    race_pos: "Finish Position",
    quali_pos: "Qualification Position",
    avg_pos: "Average Running Position",
  },
  points: {
    season_points: "Season Points",
    race_playoff_points: "Playoff Points",
    race_stage_points: "Stage Points",
  },
  passes: {
    green_flag_passes: "Passes",
    green_flag_times_passed: "Passed",
    pass_diff: "Pass Balance",
  },
};

const baseColorMap = (base, dim1, dim2) => ({ base, dim1, dim2 });

const colorMap = {
  driverA: baseColorMap("#3366CC", "#7B1FA2", "#00897B"),   // Royal Blue, Purple, Teal
  driverB: baseColorMap("#FF5722", "#F9A825", "#388E3C"),   // Orange Red, Goldenrod, Dark Green
};

const calculateRunningAverage = (data, key) => {
  let sum = 0;
  return data.map((item, idx) => {
    sum += item[key] ?? 0;
    return Number((sum / (idx + 1)).toFixed(2));
  });
};

const ComparisonTrendChart = ({ driverAData, driverBData, driverAName, driverBName, seasonA, seasonB, currentSeasonYear, currentRaceNumber, plotType }) => {
  const metricOptions = metricGroups[plotType];
  const metricKeys = Object.keys(metricOptions);

  const [selectedMetric, setSelectedMetric] = useState(metricKeys[0]);
  const [hoveredMetric, setHoveredMetric] = useState(null);

  useEffect(() => {
    setSelectedMetric(metricKeys[0]);
  }, [plotType]);

  const chartData = useMemo(() => {
    const effectiveLength =
      seasonA === currentSeasonYear || seasonB === currentSeasonYear
        ? currentRaceNumber
        : Math.min(driverAData.length, driverBData.length);

    const races = [];

    for (let i = 0; i < effectiveLength; i++) {
      const dA = driverAData[i];
      const dB = driverBData[i];
      const base = {
        race:
          seasonA === seasonB
            ? dA?.track_name || dB?.track_name || `Race ${i + 1}`
            : `R${i + 1}`,
      };

      metricKeys.forEach((metric) => {
        base[`A_${metric}`] = calculateRunningAverage(driverAData.slice(0, i + 1), metric).slice(-1)[0];
        base[`B_${metric}`] = calculateRunningAverage(driverBData.slice(0, i + 1), metric).slice(-1)[0];
      });

      races.push(base);
    }

    return races;
  }, [driverAData, driverBData, currentRaceNumber, seasonA, seasonB, currentSeasonYear, plotType]);

  const renderLegend = () => (
    <Grid container spacing={2} sx={{ color: "white", mb: 2 }}>
      <Grid item xs={6}>
        <Typography variant="subtitle2" fontWeight="bold">
          {driverAName} - {seasonA}
        </Typography>
        <Stack direction="column" spacing={1} mt={1}>
          {Object.entries(metricOptions).map(([key, label], index) => (
            <LegendItem
              key={`A_${key}`}
              label={label}
              color={Object.values(colorMap.driverA)[index]}
              bold={selectedMetric === key}
              onHover={() => setHoveredMetric(`A_${key}`)}
              onLeave={() => setHoveredMetric(null)}
            />
          ))}
        </Stack>
      </Grid>
      <Grid item xs={6}>
        <Typography variant="subtitle2" fontWeight="bold">
          {driverBName} - {seasonB}
        </Typography>
        <Stack direction="column" spacing={1} mt={1}>
          {Object.entries(metricOptions).map(([key, label], index) => (
            <LegendItem
              key={`B_${key}`}
              label={label}
              color={Object.values(colorMap.driverB)[index]}
              bold={selectedMetric === key}
              onHover={() => setHoveredMetric(`B_${key}`)}
              onLeave={() => setHoveredMetric(null)}
            />
          ))}
        </Stack>
      </Grid>
    </Grid>
  );

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Comparing {driverAName} ({seasonA}) vs {driverBName} ({seasonB})
      </Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>
        This plot shows running averages for different performance metrics across races of the selected seasons.
        Choose between <strong>position</strong>, <strong>points</strong>, or <strong>passes</strong> to explore how these drivers compare.
      </Typography>
      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {Object.entries(metricOptions).map(([key, label]) => (
          <Chip
            key={key}
            label={label}
            color={selectedMetric === key ? "primary" : "default"}
            variant={selectedMetric === key ? "filled" : "outlined"}
            onClick={() => setSelectedMetric(key)}
            clickable
          />
        ))}
      </Stack>

      {renderLegend()}

      <ResponsiveContainer width="100%" height={420}>
        <LineChart data={chartData} margin={{ top: 10, right: 30, left: 40, bottom: 90 }}>
          <XAxis dataKey="race" interval={0} angle={-60} textAnchor="end" height={100} tick={{ fontSize: 11 }} />
          <YAxis
            reversed={plotType === "position"}
            domain={plotType === "position" ? [1, "auto"] : ["auto", "auto"]}
            tick={{ fontSize: 12 }}
            tickCount={12}
            label={{
              value:
                plotType === "position"
                  ? "Position"
                  : plotType === "points"
                  ? "Cumulative Points"
                  : "Passes / Balance",
              angle: -90,
              position: "center",
              dx: -15,
            }}
          />
          <Tooltip
            formatter={(value, name) => {
              const underscoreIndex = name.indexOf("_");
              const prefix = name.slice(0, underscoreIndex);
              const metricKey = name.slice(underscoreIndex + 1);
              const label = metricOptions[metricKey] || "Unknown";
              const driver = prefix === "A" ? driverAName : driverBName;
              const season = prefix === "A" ? seasonA : seasonB;
              return [
                plotType === "position" ? `P${value.toFixed(1)}` : value.toFixed(1),
                `${driver} (${season})- ${label}`
              ];
            }}
            labelFormatter={(label) => `Track: ${label}`}
          />
          {Object.entries(colorMap).flatMap(([driverKey, colors]) => {
            return metricKeys.map((metricKey, index) => {
              const isMain = selectedMetric === metricKey;
              const id = driverKey === "driverA" ? `A_${metricKey}` : `B_${metricKey}`;
              const strokeColor = Object.values(colors)[index];
              const isHovered = hoveredMetric === id;
              return (
                <Line
                  key={id}
                  type="monotone"
                  dataKey={id}
                  stroke={strokeColor}
                  strokeWidth={isMain || isHovered ? 3.5 : 1}
                  opacity={isMain || isHovered ? 1 : 0.3}
                  dot={false}
                  style={(isMain || isHovered) ? { filter: `drop-shadow(0 0 3px ${strokeColor})` } : {}}
                  name={id}
                />
              );
            });
          })}
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
};

const LegendItem = ({ label, color, bold, onHover, onLeave }) => (
  <Box
    sx={{ display: "flex", alignItems: "center", gap: 1, cursor: "pointer" }}
    onMouseEnter={onHover}
    onMouseLeave={onLeave}
  >
    <Box sx={{ width: 16, height: 3, bgcolor: color }} />
    <Typography variant="caption" sx={{ fontWeight: bold ? 700 : 400 }}>{label}</Typography>
  </Box>
);

export default ComparisonTrendChart;
