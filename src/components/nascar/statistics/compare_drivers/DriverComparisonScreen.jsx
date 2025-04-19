import React, { useState, useMemo } from "react";
import { Box, Typography, Stack, Chip } from "@mui/material";
import DriverSelector from "./DriverSelector";
import ComparisonTrendChart from "./ComparisonTrendChart";
import DuelTileGrid from "./DuelTileGrid";
import { loadJsonData, getManySeasonData } from "../../utils/dataLoader";


const raceData = getManySeasonData("race", 2022);
const entryList = loadJsonData("entry_list.json");

const DriverComparisonScreen = ({ currentSeasonYear, currentRaceNumber, themeMode }) => {
  const allSeasons = useMemo(() => {
    return Array.from(new Set(raceData.map(r => r.season_year))).sort();
  }, []);

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


  const driversA = useMemo(() => {
    const validNames = new Set(entryList[seasonA] || []);
    const drivers = [];
  
    validNames.forEach(name => {
      const latestEntry = raceData
        .filter(d => d.season_year === seasonA && d.driver_name === name)
        .sort((a, b) => b.race_number - a.race_number)[0];
  
      if (latestEntry) {
        drivers.push({
          driver_name: name,
          car_number: latestEntry.car_number
        });
      }
    });
  
    return drivers.sort((a, b) => a.car_number - b.car_number);
  }, [seasonA]);
  

  const driversB = useMemo(() => {
    const validNames = new Set(entryList[seasonB] || []);
    const drivers = [];
  
    validNames.forEach(name => {
      const latestEntry = raceData
        .filter(d => d.season_year === seasonB && d.driver_name === name)
        .sort((a, b) => b.race_number - a.race_number)[0];
  
      if (latestEntry) {
        drivers.push({
          driver_name: name,
          car_number: latestEntry.car_number
        });
      }
    });
  
    return drivers.sort((a, b) => a.car_number - b.car_number);
  }, [seasonB]);
  

  const [driverAName, carA] = driverA.split("_") || [];
  const [driverBName, carB] = driverB.split("_") || [];

  const driverAData = useMemo(() => {
    if (!driverAName || !carA) return [];
    const maxRace = seasonA === currentSeasonYear ? currentRaceNumber : 36;
    return raceData
      .filter(d =>
        d.season_year === parseInt(seasonA) &&
        d.driver_name === driverAName &&
        d.race_number <= maxRace
      )
      .sort((a, b) => a.race_number - b.race_number);
  }, [driverAName, carA, seasonA, currentSeasonYear, currentRaceNumber]);

  const driverBData = useMemo(() => {
    if (!driverBName || !carB) return [];
    const maxRace = seasonB === currentSeasonYear ? currentRaceNumber : 36;
    return raceData
      .filter(d =>
        d.season_year === parseInt(seasonB) &&
        d.driver_name === driverBName &&
        d.race_number <= maxRace
      )
      .sort((a, b) => a.race_number - b.race_number);
  }, [driverBName, carB, seasonB, currentSeasonYear, currentRaceNumber]);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Face-to-Face Driver Comparison
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
        {Object.entries(plotTypeOptions).map(([key, label]) => (
          <Chip
            key={key}
            label={label}
            color={plotType === key ? "primary" : "default"}
            variant={plotType === key ? "filled" : "outlined"}
            onClick={() => setPlotType(key)}
            clickable
          />
        ))}
      </Stack>

      <DriverSelector
        allSeasons={allSeasons}
        allDriversA={driversA}
        allDriversB={driversB}
        driverA={driverA}
        setDriverA={setDriverA}
        driverB={driverB}
        setDriverB={setDriverB}
        seasonA={seasonA}
        setSeasonA={setSeasonA}
        seasonB={seasonB}
        setSeasonB={setSeasonB}
      />

    {driverA && driverB && driverAData.length > 0 && driverBData.length > 0 && (
      <Box sx={{ mb: 6 }}>
        <ComparisonTrendChart
          driverAData={driverAData}
          driverBData={driverBData}
          driverAName={driverAName}
          driverBName={driverBName}
          seasonA={seasonA}
          seasonB={seasonB}
          currentSeasonYear={currentSeasonYear}
          currentRaceNumber={currentRaceNumber}
          plotType={plotType}
        />
      </Box>
    )}
      <Box sx={{ mt: 4 }}>
        <DuelTileGrid driverAData={driverAData} driverBData={driverBData} seasonA={seasonA} seasonB={seasonB} />
      </Box>
    </Box>
  );
};

export default DriverComparisonScreen;