import React, { useState, useEffect } from "react";
import { Container, ToggleButton, ToggleButtonGroup, Box, Chip, Autocomplete, TextField, Stack, CircularProgress } from "@mui/material";
import { loadJsonData } from "../utils/dataLoaderAsync";
import { defaultGroupForType } from "./hooks/fantasyGroups";
import { useFantasyRaceData } from "./hooks/useFantasyRaceData";
import { renderSelectedFantasyTable } from "./hooks/renderSelectedFantasyTable";
import GroupSelector from "./hooks/groupSelector";

const FantasyMainScreen = () => {
  const [useStarGroup, setUseStarGroup] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState("I-II");
  const [selectedTable, setSelectedTable] = useState("finish");
  const [nextRaceData, setNextRaceData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [manualCompareMode, setManualCompareMode] = useState(false);
  const [manualSelectedDrivers, setManualSelectedDrivers] = useState(["Tyler Reddick"]);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await loadJsonData("next_race_data.json");
        setNextRaceData(data);
      } catch (error) {
        console.error("Error loading next race data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const {
    trackRaces,
    similarTrackRaces,
    allRaces,
    currentSeasonRaces,
    pastSeasonRaces,
    groupDrivers,
  } = useFantasyRaceData(selectedGroup, useStarGroup);

  const visibleDrivers = manualCompareMode
    ? manualSelectedDrivers
    : groupDrivers;

  const tableProps = {
    groupDrivers: visibleDrivers,
    trackRaces,
    similarTrackRaces,
    allRaces,
    currentSeasonRaces,
    pastSeasonRaces,
  };

  useEffect(() => {
    if (selectedGroup === "All") return;
  
    const defaultGroup = useStarGroup
      ? defaultGroupForType.star
      : defaultGroupForType.open;
  
    setSelectedGroup(defaultGroup);
  }, [useStarGroup]);

  useEffect(() => {
    if (
      manualCompareMode &&
      groupDrivers.includes("Tyler Reddick") &&
      manualSelectedDrivers.length === 0
    ) {
      setManualSelectedDrivers(["Tyler Reddick"]);
    }
  }, [manualCompareMode, groupDrivers]);

  if (isLoading || !nextRaceData) {
    return (
      <Container sx={{ textAlign: "center", mt: 4, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={24} />
      </Container>
    );
  }

  return (
    <Container sx={{ textAlign: "center", mt: 4 }}>
      <h2>{nextRaceData.next_race_track}</h2>

      <GroupSelector
        useStarGroup={useStarGroup}
        setUseStarGroup={setUseStarGroup}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
      />

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 2,
          mb: 2,
        }}
      >
        {/* Left: Stat Toggle */}
        <ToggleButtonGroup
          value={selectedTable}
          exclusive
          onChange={(event, newType) => newType !== null && setSelectedTable(newType)}
          aria-label="table type"
          size="small"
          sx={{
            "& .MuiToggleButton-root": {
              mx: 0.25,
              transition: "all 0.2s ease-in-out",
            },
            "& .Mui-selected": {
              boxShadow: "0 0 6px rgba(0, 150, 255, 0.5)",
              borderColor: "primary.main",
              fontWeight: "bold",
            },
          }}
        >
          <ToggleButton value="overview">Overview</ToggleButton>
          <ToggleButton value="finish">Finish</ToggleButton>
          <ToggleButton value="start">Qualification</ToggleButton>
          <ToggleButton value="points">Fantasy</ToggleButton>
          <ToggleButton value="rating">Rating</ToggleButton>
        </ToggleButtonGroup>

        {/* Right: Compare Toggle + Selector */}
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            label={manualCompareMode ? "Back to Group View" : "Manual Compare"}
            color={manualCompareMode ? "secondary" : "default"}
            onClick={() => {
              setManualCompareMode(!manualCompareMode);
              setManualSelectedDrivers([]);
            }}
            clickable
            variant="outlined"
            size="small"
          />

          {manualCompareMode && (
            <Autocomplete
              multiple
              options={groupDrivers}
              value={manualSelectedDrivers}
              onChange={(e, newVal) => setManualSelectedDrivers(newVal.slice(0, 2))}
              renderInput={(params) => (
                <TextField
                  {...params}
                  variant="outlined"
                  size="small"
                  label="Select drivers"
                />
              )}
              sx={{ minWidth: 250 }}
            />
          )}
        </Stack>
      </Box>

      {selectedGroup && groupDrivers.length > 0 && trackRaces.length > 0 && renderSelectedFantasyTable(selectedTable, tableProps)}
    </Container>
  );
};

export default FantasyMainScreen;
