import React from "react";
import { Box, Paper, Typography, Chip, Stack } from "@mui/material";

const getChipColor = (val) => {
  if (val <= 5) return "success";
  if (val <= 10) return "warning";
  return "default";
};

const DriverFormTable = ({ summaryData }) => {
  return (
    <Stack spacing={1}>
      {summaryData.map((race, i) => (
        <Paper
          key={`${race.track}-${race.date}`}
          elevation={0}
          sx={{
            p: 2,
            borderRadius: 2,
            background: race.isPlayoff
              ? "rgba(255,215,0,0.08)"
              : i % 2 === 0
              ? "rgba(255,255,255,0.015)"
              : "rgba(255,255,255,0.03)",
            border: race.isPlayoff
              ? "1px solid gold"
              : "1px solid rgba(255,255,255,0.05)",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography variant="body2" fontWeight="bold">
                {race.track}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {race.date}
              </Typography>
            </Box>

            <Stack direction="row" spacing={1}>
              {race.quali_pos !== undefined && (
                <Chip
                  label={`🚦 ${race.quali_pos}`}
                  color={getChipColor(race.quali_pos)}
                  size="small"
                />
              )}
              {race.race_pos !== undefined && (
                <Chip
                  label={`🏁 ${race.race_pos}`}
                  color={getChipColor(race.race_pos)}
                  size="small"
                />
              )}
              {race.avg_pos !== undefined && (
                <Chip
                  label={`📈 ${race.avg_pos.toFixed(1)}`}
                  color={getChipColor(race.avg_pos)}
                  size="small"
                />
              )}
              {race.driver_rating !== undefined && (
                <Chip
                  label={`⭐ ${race.driver_rating.toFixed(1)}`}
                  color="default"
                  size="small"
                />
              )}
              {race.race_stage_points !== undefined && (
                <Chip
                  label={`🔺 ${race.race_stage_points}`}
                  color="default"
                  size="small"
                />
              )}
              {race.isPlayoff && (
                <Chip
                  label="🏆 Playoff"
                  size="small"
                  variant="outlined"
                  color="warning"
                />
              )}
            </Stack>
          </Stack>
        </Paper>
      ))}
    </Stack>
  );
};

export default DriverFormTable;
