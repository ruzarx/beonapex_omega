// src/components/driver_dashboard/FavoriteDriverDashboard.jsx
import React from "react";
import { Box } from "@mui/material";

import DriverHeaderCard from "./DriverHeaderCard";
import NextRaceCountdown from "./NextRaceCountdown";
import RecentFormPanel from "./RecentFormPanel";
import QualiFormCard from "./QualiFormCard";
import TrackHistoryTable from "./TrackHistoryTable";
import QualiRaceStatsCard from "./QualiRaceStatsCard";
import OvertakesCard from "./OvertakesCard";
import DriverProspectsText from "./DriverProspectsText";
import AnimatedCard from "./AnimatedCard";
import { loadJsonData, getSeasonData } from "../../utils/dataLoader";


const nextRaceData = loadJsonData("next_race_data.json");


const FavoriteDriverDashboard = () => {
  const favoriteDriver = "Ross Chastain";
  const currentSeason = nextRaceData.next_race_number === 1 ? nextRaceData.next_race_season - 1 : nextRaceData.next_race_season;
  const currentRace = nextRaceData.next_race_number - 1;

  const lastRace = getSeasonData('standings', currentSeason, currentRace)
    .find(r => r.driver_name === favoriteDriver && r.race_number === currentRace);
  const driverStanding = getSeasonData('standings', currentSeason, currentRace)
    .find(r => r.driver_name === favoriteDriver && r.race_number === currentRace);

  const driverSummary = {
    driver_name: favoriteDriver,
    car_number: lastRace?.car_number,
    team_name: lastRace?.team_name,
    imageUrl: "/images/drivers/ross_chastain.png", // placeholder
    championship_pos: driverStanding?.pos,
    total_points: driverStanding?.season_points,
    total_wins: driverStanding?.season_wins,
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