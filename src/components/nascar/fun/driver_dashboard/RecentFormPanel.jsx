import React, { useState, useMemo, useEffect } from "react";
import {
  Card, Typography, Stack, ToggleButton, ToggleButtonGroup, Box
} from "@mui/material";
import { motion } from "framer-motion";
import DriverFormChart from "./DriverFormChart";
import DriverFormTable from "./DriverFormTable";
import { loadJsonData, getSeasonData, getTrackData } from "../../utils/dataLoaderAsync";

const RecentFormPanel = () => {
  const [metric, setMetric] = useState("race_pos");
  const [tableScope, setTableScope] = useState("recent");
  const [nextRaceData, setNextRaceData] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [driverSeasonRaces, setDriverSeasonRaces] = useState([]);
  const [driverTrackRaces, setDriverTrackRaces] = useState([]);
  const [driverSimilarTracksRaces, setDriverSimilarTracksRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const driverName = "Ross Chastain";

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [nextRace, calendarData] = await Promise.all([
          loadJsonData("next_race_data.json"),
          loadJsonData("calendar.json")
        ]);
        
        setNextRaceData(nextRace);
        setCalendar(calendarData);

        const seasonYear = nextRace.next_race_season;
        const currentRaceNumber = nextRace.next_race_number;
        const trackName = nextRace.next_race_track;

        const [seasonRaces, trackRaces, similarTrackRaces] = await Promise.all([
          getSeasonData("race", seasonYear, currentRaceNumber),
          getTrackData(2022, trackName, "exact"),
          getTrackData(2022, trackName, "both")
        ]);

        setDriverSeasonRaces(seasonRaces.filter(r => r.driver_name === driverName));
        setDriverTrackRaces(trackRaces.filter(r => r.driver_name === driverName));
        setDriverSimilarTracksRaces(similarTrackRaces.filter(r => r.driver_name === driverName));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const calendarMap = useMemo(() => {
    if (!calendar) return {};
    const map = {};
    calendar.forEach(r => {
      map[`${r.season_year}-${r.race_number}`] = r;
    });
    return map;
  }, [calendar]);

  const summarize = (races) => {
    return races
      .sort((a, b) => b.race_date - a.race_date)
      .slice(0, 5)
      .map(r => {
        const cal = calendarMap[`${r.season_year}-${r.race_number}`];
        const isPlayoff = cal?.stage?.includes("playoff");
        const date = new Date(r.race_date).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric"
        });

        return {
          track: r.track_name,
          date,
          race_pos: r.race_pos,
          quali_pos: r.quali_pos,
          avg_pos: r.avg_pos,
          isPlayoff
        };
      });
  };

  const recentRacesSummary = useMemo(() => summarize(driverSeasonRaces), [driverSeasonRaces, calendarMap]);
  const sameTrackSummary = useMemo(() => summarize(driverTrackRaces), [driverTrackRaces, calendarMap]);
  const similarTrackSummary = useMemo(() => summarize(driverSimilarTracksRaces), [driverSimilarTracksRaces, calendarMap]);

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
            RECENT FORM
          </Typography>

          <ToggleButtonGroup
            value={tableScope}
            exclusive
            onChange={(e, newScope) => {
              if (newScope !== null && newScope !== tableScope) {
                setTableScope(newScope);
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

          <Box sx={{ height: 300 }}>
            <DriverFormChart
              data={
                tableScope === "recent"
                  ? recentRacesSummary
                  : tableScope === "same_track"
                  ? sameTrackSummary
                  : similarTrackSummary
              }
              metric={metric}
            />
          </Box>

          <DriverFormTable
            summaryData={
              tableScope === "recent"
                ? recentRacesSummary
                : tableScope === "same_track"
                ? sameTrackSummary
                : similarTrackSummary
            }
          />
        </Stack>
      </Card>
    </motion.div>
  );
};

export default RecentFormPanel;