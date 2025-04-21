import React, { useState, useMemo, useEffect } from "react";
import { Box, Typography, Stack, Chip } from "@mui/material";
import DriverSelector from "./DriverSelector";
import ComparisonTrendChart from "./ComparisonTrendChart";
import DuelTileGrid from "./DuelTileGrid";
import { loadJsonData, getManySeasonData } from "../../utils/dataLoaderAsync";

const DriverComparisonScreen = ({ currentSeasonYear, currentRaceNumber, themeMode }) => {
  const [raceData, setRaceData] = useState([]);
  const [entryList, setEntryList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [data, list] = await Promise.all([
          getManySeasonData("race", currentSeasonYear),
          loadJsonData("entry_list.json")
        ]);
        setRaceData(data);
        setEntryList(list);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [currentSeasonYear]);

  const allSeasons = useMemo(() => {
    return Array.from(new Set(raceData.map(r => r.season_year))).sort();
  }, [raceData]);

  const [seasonA, setSeasonA] = useState(currentSeasonYear);
  const [seasonB, setSeasonB] = useState(currentSeasonYear);
  const [driverA, setDriverA] = useState("Kyle Larson_5");
  const [driverB, setDriverB] = useState("William Byron_24");
  const [plotType, setPlotType] = useState("position");

  const plotTypeOptions = {
    position: "Position",
    points: "Points",
    passes: "Passes",
  };

  if (isLoading || !entryList) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h6" gutterBottom>
            Driver Comparison
          </Typography>
          <Stack direction="row" spacing={2}>
            <DriverSelector
              value={driverA}
              onChange={setDriverA}
              season={seasonA}
              onSeasonChange={setSeasonA}
              seasons={allSeasons}
              entryList={entryList}
            />
            <DriverSelector
              value={driverB}
              onChange={setDriverB}
              season={seasonB}
              onSeasonChange={setSeasonB}
              seasons={allSeasons}
              entryList={entryList}
            />
          </Stack>
        </Box>

        <Box>
          <Stack direction="row" spacing={1} mb={2}>
            {Object.entries(plotTypeOptions).map(([key, label]) => (
              <Chip
                key={key}
                label={label}
                onClick={() => setPlotType(key)}
                color={plotType === key ? "primary" : "default"}
                variant={plotType === key ? "filled" : "outlined"}
              />
            ))}
          </Stack>
          <ComparisonTrendChart
            raceData={raceData}
            driverA={driverA}
            driverB={driverB}
            seasonA={seasonA}
            seasonB={seasonB}
            plotType={plotType}
            themeMode={themeMode}
          />
        </Box>

        <DuelTileGrid
          raceData={raceData}
          driverA={driverA}
          driverB={driverB}
          seasonA={seasonA}
          seasonB={seasonB}
        />
      </Stack>
    </Box>
  );
};

export default DriverComparisonScreen;