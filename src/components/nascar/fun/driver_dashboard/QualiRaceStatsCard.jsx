import React, { useMemo, useState, useEffect } from "react";
import { Card, Stack, Typography, Chip, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { loadJsonData, getSeasonData } from "../../utils/dataLoaderAsync";

const QualiRaceStatsCard = () => {
  const [nextRaceData, setNextRaceData] = useState(null);
  const [lastRace, setLastRace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const favoriteDriver = "Ross Chastain";

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const nextRace = await loadJsonData("next_race_data.json");
        setNextRaceData(nextRace);
        
        const seasonYear = nextRace.next_race_season;
        const currentRace = nextRace.next_race_number;
        
        const raceData = await getSeasonData('race', seasonYear, currentRace);
        const lastRaceData = raceData.find(r =>
          r.driver_name === favoriteDriver &&
          r.race_number === currentRace - 1
        );
        setLastRace(lastRaceData);
      } catch (error) {
        console.error("Error loading race data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [favoriteDriver]);

  if (isLoading) {
    return (
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, rgba(0,255,200,0.08), rgba(255,255,255,0.02))",
          border: "1px solid rgba(255,255,255,0.08)",
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px'
        }}
      >
        <CircularProgress size={24} />
      </Card>
    );
  }

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