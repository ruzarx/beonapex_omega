// src/components/driver_dashboard/OvertakesCard.jsx
import React, { useMemo, useState } from "react";
import {
  Box,
  Card,
  Chip,
  Stack,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  Paper,
  Fade,
} from "@mui/material";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { loadJsonData, getSeasonData, getTrackData } from "../../utils/dataLoader";

const nextRaceData = loadJsonData("next_race_data.json");
const calendar = loadJsonData("calendar.json");
const trackSimilarity = loadJsonData("track_similarity.json");

const getStats = (races) => {
  const passes = races.reduce((sum, r) => sum + (r.green_flag_passes || 0), 0);
  const passed = races.reduce((sum, r) => sum + (r.green_flag_times_passed || 0), 0);
  return { passes, passed, diff: passes - passed };
};

const OvertakesCard = () => {
  const [scope, setScope] = useState("recent");
  const favoriteDriver = "Ross Chastain";
  const seasonYear = nextRaceData.next_race_season;
  const currentRace = nextRaceData.next_race_number;

  const driverRaces = getSeasonData("race", seasonYear, currentRace).filter(r => r.driver_name === favoriteDriver);

  const trackList = useMemo(() => {
    const baseTrack = nextRaceData.next_race_track;
    return trackSimilarity[baseTrack] || [];
  }, []);

  const calendarMap = useMemo(() => {
    const map = {};
    calendar.forEach(r => {
      if (r.season_year === seasonYear) {
        map[`${seasonYear}-${r.race_number}`] = r;
      }
    });
    return map;
  }, [seasonYear]);

  const filteredRaces = useMemo(() => {
    if (scope === "recent") {
      const sorted = [...driverRaces].sort((a, b) => b.race_number - a.race_number);
      return sorted.slice(0, 5);
    }
  
    if (scope === "same_track") {
      return getTrackData(2022, nextRaceData.next_race_track, "exact")
        .filter(r => r.driver_name === favoriteDriver)
        .sort((a, b) => new Date(b.race_date) - new Date(a.race_date))
        .slice(0, 5);
    }
  
    if (scope === "track_type") {
      return getTrackData(2022, nextRaceData.next_race_track, "both")
        .filter(r => r.driver_name === favoriteDriver)
        .sort((a, b) => new Date(b.race_date) - new Date(a.race_date))
        .slice(0, 5);
    }
  
    return [];
  }, [scope, driverRaces, favoriteDriver, nextRaceData, trackList]);
  

  const { passes, passed, diff } = getStats(filteredRaces);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        elevation={0}
        sx={{
          backdropFilter: "blur(10px)",
          background: "linear-gradient(135deg, rgba(0,128,255,0.15), rgba(255,255,255,0.05))",
          borderRadius: 4,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          p: 3,
        }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle2" color="text.secondary">
            OVERTAKE STATS
          </Typography>

          <ToggleButtonGroup
            value={scope}
            exclusive
            onChange={(e, newScope) => {
              if (newScope !== null && newScope !== scope) {
                setScope(newScope);
              }
            }}            
            size="small"
            color="primary"
            fullWidth
          >
            <ToggleButton value="recent">Recent</ToggleButton>
            <ToggleButton value="same_track">This Track</ToggleButton>
            <ToggleButton value="track_type">Similar Tracks</ToggleButton>
          </ToggleButtonGroup>

          <Stack direction="row" spacing={2} justifyContent="center">
            <Box>
              <Typography variant="h6" align="center" color="success.main">
                {passes}
              </Typography>
              <Typography variant="caption" align="center" display="block">
                Passes
              </Typography>
            </Box>
            <Box>
              <Typography variant="h6" align="center" color="error.main">
                {passed}
              </Typography>
              <Typography variant="caption" align="center" display="block">
                Times Passed
              </Typography>
            </Box>
            <Box>
              <Chip
                label={(diff >= 0 ? "+" : "") + diff}
                color={diff > 0 ? "success" : diff < 0 ? "error" : "default"}
                variant="outlined"
                sx={{ fontWeight: "bold" }}
              />
              <Typography variant="caption" align="center" display="block">
                Pass Balance
              </Typography>
            </Box>
          </Stack>

          <Divider />

          <Stack spacing={1} key={scope}>
            {filteredRaces.map((race, index) => {
              const raceDiff = (race.green_flag_passes || 0) - (race.green_flag_times_passed || 0);
              const date = new Date(race.race_date);
              const raceMeta = calendarMap[`${race.season_year}-${race.race_number}`];
              const isPlayoff = raceMeta?.stage?.includes("playoff");

              return (
                <Fade in timeout={400 + index * 100} key={`${scope}-${race.season_year}-${race.race_number}-${race.track_name}`}>
                  <Paper
                    elevation={0}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      px: 2,
                      py: 1,
                      borderRadius: 2,
                      background: isPlayoff ? "rgba(255,215,0,0.08)" : index % 2 === 0 ? "rgba(255,255,255,0.015)" : "rgba(255,255,255,0.03)",
                      border: isPlayoff ? "1px solid gold" : "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <Box>
                      <Typography variant="body2" fontWeight="bold">
                        {race.track_name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {format(date, "MMMM yyyy")}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={`🟢 ${race.green_flag_passes}`}
                        size="small"
                        sx={{ bgcolor: "#4caf50", color: "white" }}
                      />
                      <Chip
                        label={`🔴 ${race.green_flag_times_passed}`}
                        size="small"
                        sx={{ bgcolor: "#ef5350", color: "white" }}
                      />
                      <Chip
                        label={(raceDiff >= 0 ? "+" : "") + raceDiff}
                        size="small"
                        variant="outlined"
                        color={raceDiff > 0 ? "success" : raceDiff < 0 ? "error" : "default"}
                        sx={{ fontWeight: "bold" }}
                      />
                    </Stack>
                  </Paper>
                </Fade>
              );
            })}
          </Stack>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default OvertakesCard;