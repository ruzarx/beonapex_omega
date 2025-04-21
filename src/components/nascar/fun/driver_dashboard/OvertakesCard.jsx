// src/components/driver_dashboard/OvertakesCard.jsx
import React, { useMemo, useState, useEffect } from "react";
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
import { loadJsonData, getSeasonData, getTrackData } from "../../utils/dataLoaderAsync";

const OvertakesCard = () => {
  const [scope, setScope] = useState("recent");
  const [nextRaceData, setNextRaceData] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [trackSimilarity, setTrackSimilarity] = useState(null);
  const [driverRaces, setDriverRaces] = useState([]);
  const [filteredRaces, setFilteredRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [nextRace, calendarData, trackSim] = await Promise.all([
          loadJsonData("next_race_data.json"),
          loadJsonData("calendar.json"),
          loadJsonData("track_similarity.json")
        ]);
        
        setNextRaceData(nextRace);
        setCalendar(calendarData);
        setTrackSimilarity(trackSim);

        const favoriteDriver = "Ross Chastain";
        const seasonYear = nextRace.next_race_season;
        const currentRace = nextRace.next_race_number;

        const races = await getSeasonData("race", seasonYear, currentRace);
        const filteredRaces = races.filter(r => r.driver_name === favoriteDriver);
        setDriverRaces(filteredRaces);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const updateFilteredRaces = async () => {
      if (!nextRaceData || !driverRaces.length) return;

      try {
        setIsLoading(true);
        let filtered = [];

        if (scope === "recent") {
          const sorted = [...driverRaces].sort((a, b) => b.race_number - a.race_number);
          filtered = sorted.slice(0, 5);
        } else if (scope === "same_track") {
          const trackRaces = await getTrackData(2022, nextRaceData.next_race_track, "exact");
          filtered = trackRaces
            .filter(r => r.driver_name === "Ross Chastain")
            .sort((a, b) => new Date(b.race_date) - new Date(a.race_date))
            .slice(0, 5);
        } else if (scope === "track_type") {
          const trackRaces = await getTrackData(2022, nextRaceData.next_race_track, "both");
          filtered = trackRaces
            .filter(r => r.driver_name === "Ross Chastain")
            .sort((a, b) => new Date(b.race_date) - new Date(a.race_date))
            .slice(0, 5);
        }

        setFilteredRaces(filtered);
      } catch (error) {
        console.error("Error filtering races:", error);
      } finally {
        setIsLoading(false);
      }
    };

    updateFilteredRaces();
  }, [scope, nextRaceData, driverRaces]);

  const getStats = (races) => {
    const passes = races.reduce((sum, r) => sum + (r.green_flag_passes || 0), 0);
    const passed = races.reduce((sum, r) => sum + (r.green_flag_times_passed || 0), 0);
    return { passes, passed, diff: passes - passed };
  };

  const { passes, passed, diff } = getStats(filteredRaces);

  const calendarMap = useMemo(() => {
    if (!calendar) return {};
    const map = {};
    calendar.forEach(r => {
      if (r.season_year === nextRaceData?.next_race_season) {
        map[`${nextRaceData.next_race_season}-${r.race_number}`] = r;
      }
    });
    return map;
  }, [calendar, nextRaceData]);

  if (isLoading || !nextRaceData) {
    return (
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
        <Typography>Loading...</Typography>
      </Card>
    );
  }

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