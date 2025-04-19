import React, { useState } from "react";
import { Box, ToggleButton, ToggleButtonGroup } from "@mui/material";

import SeasonStandings from "./SeasonStandings";
import PlayoffStandings from "./PlayoffStandings";

const StandingsPage = ({
  seasonYear,
  currentRace,
  themeMode,
  onDriverClick,
  onSeasonChange
}) => {
  const [viewMode, setViewMode] = useState("regular");

  const handleViewToggle = (event, newView) => {
    if (newView !== null) {
      setViewMode(newView);
    }
  };

  const handleSeasonToggle = (event, newSeason) => {
    if (newSeason !== null) {
      onSeasonChange(newSeason);
    }
  };

  return (
    <Box>
      <ToggleButtonGroup
        color="secondary"
        value={viewMode}
        exclusive
        onChange={handleViewToggle}
        sx={{ mb: 2 }}
      >
        <ToggleButton value="regular">Regular Season</ToggleButton>
        <ToggleButton value="playoffs">Playoffs</ToggleButton>
      </ToggleButtonGroup>

      {/* Conditional Standings */}
      {viewMode === "regular" && (
        <SeasonStandings
          seasonYear={seasonYear}
          currentRace={currentRace}
          themeMode={themeMode}
          onDriverClick={onDriverClick}
        />
      )}
      {viewMode === "playoffs" && (
        <PlayoffStandings
          seasonYear={seasonYear}
          currentRace={currentRace}
          themeMode={themeMode}
          onDriverClick={onDriverClick}
        />
      )}
    </Box>
  );
};

export default StandingsPage;
