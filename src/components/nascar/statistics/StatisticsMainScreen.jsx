import React, { useState } from "react";
import {
  Box, Tabs, Tab, ToggleButton, ToggleButtonGroup, Chip
} from "@mui/material";

import { loadJsonData } from "../utils/dataLoader";

import RaceSelector from "./RaceSelector";
import StandingsPage from "./standings/StandingsPage";
import RaceResults from "./results/RaceResults";
import StandingsDriverDrawer from "./standings/StandingsDriverDrawer";
import ResultsDriverDrawer from "./results/ResultsDrawer";
import DetailedStats from "./stats/DetailedStats";
import DriverComparisonScreen from "./compare_drivers/DriverComparisonScreen";
import TrackOverviewTable from "./tracks/TrackOverviewTable";

const racesData = loadJsonData("calendar.json");
const nextRaceData = loadJsonData("next_race_data.json");

const drawerWidth = 240;
const collapsedWidth = 64;

const StatisticsMainScreen = (themeMode) => {
  const [selectedTab, setSelectedTab] = useState("standings");
  const [seasonYear, setSeasonYear] = useState(2025);
  const [showAllYears, setShowAllYears] = useState(false);

  const getLatestRaceNumber = (year) => {
    const today = new Date();
    const seasonRaces = racesData.filter((r) => (r.season_year === year && new Date(r.race_date) <= today));
    return Math.max(...seasonRaces.map((r) => r.race_number));
  };
  
  const initialSeasonYear =
  nextRaceData["next_race_number"] <= 36
  ? nextRaceData["next_race_season"]
  : nextRaceData["next_race_season"] - 1;
  const initialRaceNumber = getLatestRaceNumber(initialSeasonYear);

  const [currentRace, setCurrentRace] = useState(initialRaceNumber);
  const [raceSelectorOpen, setRaceSelectorOpen] = useState(false);
  const [driverDrawerOpen, setDriverDrawerOpen] = useState(false);

  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleRaceSelect = (race) => {
    setCurrentRace(race.race_number);
    setSeasonYear(new Date(race.race_date).getFullYear());
  };

  const handleDriverClick = (driverName) => {
    setSelectedDriver(driverName);
    setDriverDrawerOpen(true);
  };
  
  const handleDrawerClose = () => {
    setDriverDrawerOpen(false);
    setSelectedDriver(null);
  };
  

  const filteredRaces = racesData.filter(
    (race) => race.season_year === seasonYear
  );

  const currentRaceInfo = racesData.find(
    (r) => r.season_year === seasonYear && r.race_number === currentRace
  );
  
  const currentRaceName = currentRaceInfo?.race_name || "Race";

  const formatDate = (rawDate) => {
    const d = new Date(rawDate);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };
  
  const raceChipLabel = currentRaceInfo
    ? `Race ${currentRaceInfo.race_number}: ${currentRaceInfo.race_name} (${formatDate(currentRaceInfo.race_date)})`
    : "Race Info";
  

  return (
    <Box sx={{ display: "flex" }}>
      {/* Only show RaceSelector for standings and results tabs */}
      {(selectedTab === "standings" || selectedTab === "results") && (
        <RaceSelector
          races={filteredRaces}
          currentRace={currentRace}
          onSelect={handleRaceSelect}
          open={raceSelectorOpen}
          onToggle={() => setRaceSelectorOpen((prev) => !prev)}
        />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          marginLeft: (selectedTab === "standings" || selectedTab === "results") && raceSelectorOpen 
            ? `${drawerWidth}px` 
            : `${collapsedWidth}px`,
          transition: "margin 0.3s ease",
          padding: 2,
        }}
      >
        <Tabs value={selectedTab} onChange={handleTabChange} centered>
          <Tab label="Standings" value="standings" />
          <Tab label="Results" value="results" />
          <Tab label="Stats" value="stats" />
          <Tab label="Compare Drivers" value="compare" />
          <Tab label="Track" value="tracks" />
        </Tabs>

        <Box
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    mb: 2,
    flexWrap: "wrap",
    gap: 2
  }}
>
  {selectedTab === "stats" ? (
    <ToggleButtonGroup
      color="primary"
      value={showAllYears ? "all" : seasonYear}
      exclusive
      onChange={(e, newValue) => {
        if (newValue !== null) {
          if (newValue === "all") {
            setShowAllYears(true);
            setSeasonYear(null);
          } else {
            setShowAllYears(false);
            setSeasonYear(parseInt(newValue));
          }
        }
      }}
    >
      <ToggleButton value="all">All Years</ToggleButton>
      <ToggleButton value={2022}>2022</ToggleButton>
      <ToggleButton value={2023}>2023</ToggleButton>
      <ToggleButton value={2024}>2024</ToggleButton>
      <ToggleButton value={2025}>2025</ToggleButton>
    </ToggleButtonGroup>
      ) : (selectedTab !== "compare" && selectedTab !== "tracks") && (
        <ToggleButtonGroup
          color="primary"
          value={seasonYear}
          exclusive
          onChange={(e, newSeason) => {
            if (newSeason !== null) {
              setSeasonYear(newSeason);
              setCurrentRace(getLatestRaceNumber(newSeason));
            }
          }}
        >
          <ToggleButton value={2022}>2022</ToggleButton>
          <ToggleButton value={2023}>2023</ToggleButton>
          <ToggleButton value={2024}>2024</ToggleButton>
          <ToggleButton value={2025}>2025</ToggleButton>
        </ToggleButtonGroup>
      )}

      {(selectedTab === "standings" || selectedTab === "results") && (
        <Chip
          label={raceChipLabel}
          color="info"
          variant="outlined"
          sx={{ fontWeight: "bold", fontSize: "0.9rem" }}
          size="medium"
        />
      )}
    </Box>


        <Box sx={{ mt: 3 }}>
          {selectedTab === "standings" && (
            <StandingsPage
              seasonYear={seasonYear}
              currentRace={currentRace}
              themeMode={themeMode}
              onDriverClick={handleDriverClick}
              onSeasonChange={setSeasonYear}
            />
          )}
          {selectedTab === "results" && (
            <RaceResults
              seasonYear={seasonYear}
              currentRace={currentRace}
              themeMode={themeMode}
              onDriverClick={handleDriverClick}
            />
          )}
          {selectedTab === "stats" && (
            <DetailedStats
              seasonYear={seasonYear}
              showAllYears={showAllYears}
              themeMode={themeMode}
              onDriverClick={handleDriverClick}
            />
          )}
          {selectedTab === "compare" && (
            <DriverComparisonScreen
              currentSeasonYear={
                nextRaceData["next_race_number"] <= 36
                  ? nextRaceData["next_race_season"]
                  : nextRaceData["next_race_season"] - 1
              }
              currentRaceNumber={getLatestRaceNumber(
                nextRaceData["next_race_number"] <= 36
                  ? nextRaceData["next_race_season"]
                  : nextRaceData["next_race_season"] - 1
              )}
              themeMode={themeMode}
            />
          )}
          {selectedTab === "tracks" && (
            <TrackOverviewTable themeMode={themeMode}/>
          )}
        </Box>
      </Box>

      {selectedTab === "standings" && (
        <StandingsDriverDrawer
          driver={selectedDriver}
          open={driverDrawerOpen}
          onClose={handleDrawerClose}
          seasonYear={seasonYear}
          currentRace={currentRace}
        />
      )}

      {selectedTab === "results" && (
        <ResultsDriverDrawer
          driver={selectedDriver}
          open={driverDrawerOpen}
          onClose={handleDrawerClose}
          seasonYear={seasonYear}
          currentRace={currentRace}
          raceName={currentRaceInfo.race_name}
        />
      )}

    </Box>
  );
};

export default StatisticsMainScreen;