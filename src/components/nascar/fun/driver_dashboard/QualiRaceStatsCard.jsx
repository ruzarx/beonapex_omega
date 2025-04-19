import React, { useMemo } from "react";
import { Card, Stack, Typography, Chip } from "@mui/material";
import { motion } from "framer-motion";
import { loadJsonData, getSeasonData } from "../../utils/dataLoader";

const nextRaceData = loadJsonData("next_race_data.json");

const QualiRaceStatsCard = () => {
  const favoriteDriver = "Ross Chastain";
  const seasonYear = nextRaceData.next_race_season;
  const currentRace = nextRaceData.next_race_number;

  const lastRace = useMemo(() => {
    return getSeasonData('race', seasonYear, currentRace).find(r =>
      r.driver_name === favoriteDriver &&
      r.race_number === currentRace - 1
    );
  }, [favoriteDriver, seasonYear, currentRace]);

  if (!lastRace) return null;

  const stagePoints = (lastRace.stage_1_pts || 0) + (lastRace.stage_2_pts || 0) + (lastRace.stage_3_pts || 0);
  const status = lastRace.status === "finished" ? "✔ Finished" : "❌ DNF";
  const statusColor = lastRace.status === "finished" ? "success" : "error";
  const date = new Date(lastRace.race_date).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, rgba(0,255,200,0.08), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            LAST RACE SUMMARY
          </Typography>
          <Typography variant="body2" fontWeight="bold">
            {lastRace.track_name} — {date}
          </Typography>

          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">Start Pos</Typography>
            <Typography variant="body2">P{lastRace.start_pos}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">Finish Pos</Typography>
            <Typography variant="body2">P{lastRace.race_pos}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">Avg Running Pos</Typography>
            <Typography variant="body2">{lastRace.avg_pos?.toFixed(1)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">Driver Rating</Typography>
            <Typography variant="body2">{lastRace.driver_rating?.toFixed(1)}</Typography>
          </Stack>
          <Stack direction="row" justifyContent="space-between">
            <Typography variant="caption">Stage Points</Typography>
            <Typography variant="body2">{stagePoints}</Typography>
          </Stack>

          <Stack direction="row" justifyContent="flex-end" mt={1}>
            <Chip
              label={status}
              color={statusColor}
              size="small"
              variant="outlined"
            />
          </Stack>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default QualiRaceStatsCard;