// src/components/driver_dashboard/FavoriteDriverDashboard.jsx
import React, { useState, useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";

import DriverHeaderCard from "./DriverHeaderCard";
import NextRaceCountdown from "./NextRaceCountdown";
import RecentFormPanel from "./RecentFormPanel";
import QualiFormCard from "./QualiFormCard";
import TrackHistoryTable from "./TrackHistoryTable";
import QualiRaceStatsCard from "./QualiRaceStatsCard";
import OvertakesCard from "./OvertakesCard";
import DriverProspectsText from "./DriverProspectsText";
import AnimatedCard from "./AnimatedCard";
import { loadJsonData, getSeasonData } from "../../utils/dataLoaderAsync";

const FavoriteDriverDashboard = () => {
  const [nextRaceData, setNextRaceData] = useState(null);
  const [lastRace, setLastRace] = useState(null);
  const [driverStanding, setDriverStanding] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const favoriteDriver = "Ross Chastain";

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Starting data load...");
        setIsLoading(true);
        setError(null);

        // First load next race data
        console.log("Loading next race data...");
        const nextRace = await loadJsonData("next_race_data.json");
        console.log("Next race data loaded:", nextRace);
        
        if (!nextRace) {
          throw new Error("Failed to load next race data");
        }
        setNextRaceData(nextRace);

        // Calculate current season and race based on next race data
        const currentSeason = nextRace.next_race_number === 1 
          ? nextRace.next_race_season - 1 
          : nextRace.next_race_season;
        const currentRace = nextRace.next_race_number === 1 
          ? 36 
          : nextRace.next_race_number - 1;

        console.log(`Loading standings for season ${currentSeason}, race ${currentRace}...`);
        // Then load standings data
        const standings = await getSeasonData('standings', currentSeason, currentRace);
        console.log("Standings data loaded:", standings);
        
        if (!standings || standings.length === 0) {
          throw new Error(`No standings data available for season ${currentSeason}`);
        }
        
        const lastRaceData = standings.find(r => r.driver_name === favoriteDriver && r.race_number === currentRace);
        const standingData = standings.find(r => r.driver_name === favoriteDriver && r.race_number === currentRace);

        console.log("Found driver data:", { lastRaceData, standingData });

        if (!lastRaceData || !standingData) {
          throw new Error(`No data available for driver ${favoriteDriver} in season ${currentSeason}`);
        }

        setLastRace(lastRaceData);
        setDriverStanding(standingData);
        console.log("Data loading completed successfully");
      } catch (err) {
        console.error("Error loading dashboard data:", err);
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="error" gutterBottom>
          Error Loading Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {error.message}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
          Please check the console for more details.
        </Typography>
      </Box>
    );
  }

  if (!lastRace || !driverStanding) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          No Data Available
        </Typography>
        <Typography variant="body1" color="text.secondary">
          No race data is currently available for {favoriteDriver}.
        </Typography>
      </Box>
    );
  }

  const driverSummary = {
    driver_name: favoriteDriver,
    car_number: lastRace.car_number,
    team_name: lastRace.team_name,
    imageUrl: "/images/drivers/ross_chastain.png", // placeholder
    championship_pos: driverStanding.pos,
    total_points: driverStanding.season_points,
    total_wins: driverStanding.season_wins,
  };

  return (
    <Box
      sx={{
        p: 2,
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: 2,
        alignItems: "start",
      }}
    >
      <AnimatedCard delay={0.1}>
        <Box sx={{ gridColumn: "span 1" }}>
          <DriverHeaderCard driver={driverSummary} />
        </Box>
      </AnimatedCard>

      <AnimatedCard delay={0.2}>
        <Box sx={{ gridColumn: "span 1" }}>
          <NextRaceCountdown nextRaceData={nextRaceData} />
        </Box>
      </AnimatedCard>

      <AnimatedCard delay={0.3}>
        <Box sx={{ gridColumn: "span 1" }}>
          <OvertakesCard />
        </Box>
      </AnimatedCard>

      <AnimatedCard delay={0.4}>
        <Box sx={{ gridColumn: "span 2" }}>
          <RecentFormPanel />
        </Box>
      </AnimatedCard>

      <AnimatedCard delay={0.5}>
        <Box sx={{ gridColumn: "span 1" }}>
          <QualiRaceStatsCard />
        </Box>
      </AnimatedCard>

      <AnimatedCard delay={0.6}>
        <Box sx={{ gridColumn: "span 1" }}>
          <DriverProspectsText />
        </Box>
      </AnimatedCard>

      <AnimatedCard delay={0.7}>
        <Box sx={{ gridColumn: "span 3" }}>
          <TrackHistoryTable />
        </Box>
      </AnimatedCard>

      <AnimatedCard delay={0.8}>
        <Box sx={{ gridColumn: "span 2" }}>
          <QualiFormCard />
        </Box>
      </AnimatedCard>
    </Box>
  );
};

export default FavoriteDriverDashboard;