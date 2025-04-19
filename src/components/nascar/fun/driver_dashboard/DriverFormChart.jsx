// src/components/driver_dashboard/DriverFormChart.jsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";

const DriverFormChart = ({ metric, seasonRaceData }) => {
  const formData = useMemo(() => {
    if (!Array.isArray(seasonRaceData)) return [];

    const sorted = [...seasonRaceData].sort((a, b) => a.race_number - b.race_number);
    const smoothed = [];

    for (let i = 4; i < sorted.length; i++) {
      const chunk = sorted.slice(0, i + 1);
      smoothed.push({
        race: chunk[i].race_number,
        race_pos: chunk.reduce((sum, r) => sum + (r.race_pos || 0), 0) / chunk.length,
        quali_pos: chunk.reduce((sum, r) => sum + (r.quali_pos || 0), 0) / chunk.length,
        avg_pos: chunk.reduce((sum, r) => sum + (r.avg_pos || 0), 0) / chunk.length,
      });
    }

    return smoothed;
  }, [seasonRaceData]);

  return (
    <ResponsiveContainer width="100%" height={250}>
      <LineChart data={formData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="race" />
        <YAxis reversed domain={[1, 40]} label={{ value: "Position", angle: -90, position: "insideLeft" }} />
        <Tooltip />
        <Line
          type="monotone"
          dataKey={metric}
          stroke="#7e57c2"
          strokeWidth={3}
          dot={{ r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default DriverFormChart;
