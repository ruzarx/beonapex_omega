import React, { useState, useMemo, useEffect } from "react";
import {
  Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
  Box, Typography, IconButton, Collapse, CircularProgress
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  getAvgValue,
  getSumValue,
  compareAvgToPrevSeason,
  getEntities,
} from "../../utils/statsCalculations";
import { loadJsonData } from "../../utils/dataLoaderAsync";

const ExpandedRowContent = ({ entity, racerType, raceData, isDark }) => {
  const [calendar, setCalendar] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await loadJsonData("calendar.json");
        setCalendar(data);
      } catch (error) {
        console.error("Error loading calendar:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };
  const headerCellStyle = {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.05rem",
    color: isDark ? "#dddddd" : "#333333",
    bgcolor: isDark ? "#111111" : "#f5f5f5",
    borderBottom: `2px solid ${isDark ? "#333" : "#ccc"}`,
    px: 1,
    py: 1
  };

  const entityRaces = useMemo(() => {
    if (!calendar) return [];
    
    const races = raceData.filter(r => 
      r[racerType === "driver" ? "driver_name" : 
         racerType === "team" ? "team_name" : "manufacturer"] === entity
    );

    if (racerType === "driver") {
      return races
        .sort((a, b) => {
          if (a.season_year !== b.season_year) return b.season_year - a.season_year;
          return b.race_number - a.race_number;
        })
        .slice(0, 10)
        .map(race => ({
          ...race,
          pct_top_15: ((race.top_15_laps / race.total_laps) * 100).toFixed(1),
          pct_laps_led: ((race.laps_led / race.total_laps) * 100).toFixed(1)
        }));
    } else {
      const raceMap = new Map();
      
      races.forEach(race => {
        const raceKey = `${race.season_year}-${race.race_number}-${race.track_name}`;
        if (!raceMap.has(raceKey)) {
          raceMap.set(raceKey, {
            season_year: race.season_year,
            race_number: race.race_number,
            track_name: race.track_name,
            race_positions: [],
            quali_positions: [],
            avg_positions: [],
            top_15_laps: 0,
            total_laps: 0,
            laps_led: 0,
            total_cars: 0,
          });
        }
        
        const raceData = raceMap.get(raceKey);
        raceData.race_positions.push(race.race_pos);
        raceData.quali_positions.push(race.quali_pos);
        raceData.avg_positions.push(race.avg_pos);
        raceData.top_15_laps += race.top_15_laps || 0;
        raceData.total_laps += race.total_laps || 0;
        raceData.laps_led += race.laps_led || 0;
        raceData.total_cars++;
      });

      // Convert aggregated data to array and sort
      return Array.from(raceMap.values())
        .sort((a, b) => {
          if (a.season_year !== b.season_year) return b.season_year - a.season_year;
          return b.race_number - a.race_number;
        })
        .slice(0, 10)
        .map(race => ({
          ...race,
          race_pos: (race.race_positions.reduce((a, b) => a + b, 0) / race.race_positions.length).toFixed(1),
          quali_pos: (race.quali_positions.reduce((a, b) => a + b, 0) / race.quali_positions.length).toFixed(1),
          avg_pos: (race.avg_positions.reduce((a, b) => a + b, 0) / race.avg_positions.length).toFixed(1),
          pct_top_15: ((race.top_15_laps / race.total_laps) * 100).toFixed(1),
          pct_laps_led: ((race.laps_led / race.total_laps) * 100).toFixed(1)
        }));
    }
  }, [raceData, entity, racerType, calendar]);

  const playoffLabelMap = {
    playoff_16: 'Round 16',
    playoff_12: 'Round 12',
    playoff_8:  'Round 8',
    playoff_4:  'Final'
  };

  if (isLoading || !calendar) {
    return (
      <Box sx={{ margin: 1 }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Box sx={{ margin: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Last 10 Races
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle}>Race</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Finish" : "Avg Finish"}</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Start" : "Avg Start"}</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Avg Position" : "Avg Running Pos"}</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Top-15 Laps" : "Total Top-15 Laps"}</TableCell>
            <TableCell sx={headerCellStyle}>% Top-15 Laps</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Laps Led" : "Total Laps Led"}</TableCell>
            <TableCell sx={headerCellStyle}>% Laps Led</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entityRaces.map((race, index) => {
            const calendarRace = calendar.find(
              c => c.season_year === race.season_year && c.race_number === race.race_number
            );
            const monthLabel = calendarRace
              ? new Date(calendarRace.race_date).toLocaleString('en-US', { month: 'short' })
              : null;
            const playoffNote = calendarRace?.stage && calendarRace.stage !== 'season'
              ? playoffLabelMap[calendarRace.stage]
              : null;

            return (
              <TableRow key={index}
                sx={{
                  bgcolor: index % 2 === 0 
                    ? (isDark ? "#1e1e1e" : "#fff")
                    : (isDark ? "#2a2a2a" : "#f9f9f9")
                }}
              >
                <TableCell sx={{ ...cellStyle, textAlign: 'left' }}>
                  <span style={{ fontWeight: 500 }}>{race.track_name}</span>
                  <span style={{
                    marginLeft: 6,
                    color: isDark ? '#bbbbbb' : '#666666',
                    fontStyle: 'italic',
                    fontSize: '0.8rem'
                  }}>
                    ({monthLabel} {race.season_year})
                  </span>
                  {playoffNote && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: '0.75rem',
                      color: isDark ? '#ffa726' : '#d84315',
                      fontWeight: 500
                    }}>
                      – {playoffNote}
                    </span>
                  )}
                </TableCell>
                <TableCell sx={cellStyle}>{race.race_pos}</TableCell>
                <TableCell sx={cellStyle}>{race.quali_pos}</TableCell>
                <TableCell sx={cellStyle}>{race.avg_pos}</TableCell>
                <TableCell sx={cellStyle}>{race.top_15_laps}</TableCell>
                <TableCell sx={cellStyle}>{race.pct_top_15}%</TableCell>
                <TableCell sx={cellStyle}>{race.laps_led}</TableCell>
                <TableCell sx={cellStyle}>{race.pct_laps_led}%</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

// First, add a helper function to get the number of completed races in current season
const getCurrentSeasonRaceCount = (data, year) => {
  return data.filter(r => r.season_year === year).length;
};

const PositionStatTable = ({
  racerType,
  lastRaceData,
  raceData,
  seasonYear,
  prevSeasonData,
  isDark,
  showAllYears,
}) => {
  const [sortKey, setSortKey] = useState("race_pos");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedRow, setExpandedRow] = useState(null);

  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };
  const headerCellStyle = {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.05rem",
    color: isDark ? "#dddddd" : "#333333",
    bgcolor: isDark ? "#111111" : "#f5f5f5",
    borderBottom: `2px solid ${isDark ? "#333" : "#ccc"}`,
    px: 1,
    py: 1
  };

  // Helper function to get the latest entry for a driver
  const getLatestDriverInfo = (driverName) => {
    const driverRaces = raceData.filter(r => r.driver_name === driverName);
    if (driverRaces.length === 0) return null;
    
    // Sort by season_year and race_number to get the latest
    return driverRaces.sort((a, b) => 
      b.season_year - a.season_year || b.race_number - a.race_number
    )[0];
  };

  // Get year range for the data
  const years = [...new Set(raceData.map(r => r.season_year))].sort();
  const yearRange = years.length > 1 
    ? `${Math.min(...years)}-${Math.max(...years)}`
    : seasonYear.toString();

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const rawEntities = getEntities(
    raceData, 
    racerType, 
    showAllYears ? null : seasonYear,
    "avg_pos", 
    true
  );

  const entities = useMemo(() => {
    const getValue = (entity) => {
      if (sortKey === "top_15_laps" || sortKey === "laps_led") {
        return getSumValue(raceData, entity, sortKey, racerType);
      } else if (sortKey === "avg_pos_diff_prev") {
        // Get the number of races completed in current season
        const currentSeasonRaces = getCurrentSeasonRaceCount(raceData, seasonYear);
        
        // Filter current season data
        const currentSeasonData = raceData
          .filter(r => r.season_year === seasonYear)
          .sort((a, b) => a.race_number - b.race_number);

        // Filter previous season data and take only the same number of races
        const prevSeasonLimitedData = prevSeasonData
          .filter(r => r.season_year === seasonYear - 1)
          .sort((a, b) => a.race_number - b.race_number)
          .slice(0, currentSeasonRaces);

        return compareAvgToPrevSeason(
          currentSeasonData, 
          prevSeasonLimitedData, 
          entity, 
          "avg_pos", 
          racerType
        );
      } else {
        return getAvgValue(raceData, entity, sortKey, racerType);
      }
    };

    return [...rawEntities].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [rawEntities, raceData, prevSeasonData, racerType, sortKey, sortDirection, seasonYear]);

  const applyZebraTint = (colorEven, colorOdd, index) =>
    index % 2 === 0 ? colorEven : colorOdd;

  return (
    <TableContainer>
      <Box mb={2}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic", mt: 0.5 }}
        >
          Statistics on race positions — based on results for {yearRange}.
        </Typography>
      </Box>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: "primary.main" }}>
            <TableCell sx={headerCellStyle}/>
            {racerType === "driver" && (<TableCell sx={headerCellStyle}>Driver</TableCell>)}
            {racerType === "driver" && (<TableCell sx={headerCellStyle}>#</TableCell>)}
            {racerType !== "manufacturer" && (<TableCell sx={headerCellStyle}>Team</TableCell>)}
            {racerType === "manufacturer" && (<TableCell sx={headerCellStyle}>Make</TableCell>)}
            <TableCell onClick={() => handleSort("race_pos")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Finish Pos</TableCell>
            <TableCell onClick={() => handleSort("quali_pos")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Start Pos</TableCell>
            <TableCell onClick={() => handleSort("avg_pos")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Running Pos</TableCell>
            <TableCell onClick={() => handleSort("top_15_laps")} sx={{...headerCellStyle, cursor: "pointer" }}>Top-15 Laps</TableCell>
            <TableCell onClick={() => handleSort("pct_top_15_laps")} sx={{...headerCellStyle, cursor: "pointer" }}>% Top-15 Laps</TableCell>
            <TableCell onClick={() => handleSort("laps_led")} sx={{...headerCellStyle, cursor: "pointer" }}>Lead Laps</TableCell>
            <TableCell onClick={() => handleSort("pct_laps_led")} sx={{...headerCellStyle, cursor: "pointer" }}>% Lead Laps</TableCell>
            <TableCell onClick={() => handleSort("avg_pos_diff_prev")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Running Pos Diff To Previous Season</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {entities.map((entity, index) => (
            <React.Fragment key={index}>
              <TableRow
                sx={{
                  bgcolor: applyZebraTint(
                    isDark ? "#1e1e1e" : "#fff",
                    isDark ? "#2a2a2a" : "#f9f9f9",
                    index
                  ),
                  '& > *': { borderBottom: 'unset' },
                  cursor: 'pointer',
                }}
              >
                <TableCell>
                  <IconButton size="small" onClick={() => setExpandedRow(expandedRow === entity ? null : entity)}>
                    {expandedRow === entity ? 
                      <KeyboardArrowUpIcon /> : 
                      <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                {racerType === "driver" && <TableCell sx={{...cellStyle, textAlign: 'left'}}>{entity}</TableCell>}
                {racerType === "driver" && (
                  <TableCell sx={cellStyle}>
                    {(lastRaceData.length > 0 
                      ? lastRaceData.find((r) => r.driver_name === entity)?.car_number
                      : getLatestDriverInfo(entity)?.car_number
                    )}
                  </TableCell>
                )}
                {racerType === "driver" && (
                  <TableCell sx={{...cellStyle, textAlign: 'left'}}>
                    {(lastRaceData.length > 0 
                      ? lastRaceData.find((r) => r.driver_name === entity)?.team_name
                      : getLatestDriverInfo(entity)?.team_name
                    )}
                  </TableCell>
                )}
                {racerType !== "driver" && <TableCell sx={{...cellStyle, textAlign: 'left'}}>{entity}</TableCell>}

                <TableCell sx={cellStyle}>{getAvgValue(raceData, entity, "race_pos", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{getAvgValue(raceData, entity, "quali_pos", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{getAvgValue(raceData, entity, "avg_pos", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{getSumValue(raceData, entity, "top_15_laps", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{getAvgValue(raceData, entity, "pct_top_15_laps", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{getSumValue(raceData, entity, "laps_led", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{getAvgValue(raceData, entity, "pct_laps_led", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{compareAvgToPrevSeason(raceData, prevSeasonData, entity, "avg_pos", racerType)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell 
                  style={{ paddingBottom: 0, paddingTop: 0 }} 
                  colSpan={
                    racerType === "driver" 
                      ? 13  // 1 (expand) + 1 (driver) + 1 (#) + 1 (team) + 8 (stats) + 1 (diff)
                      : 11  // 1 (expand) + 1 (name) + 8 (stats) + 1 (diff)
                  }
                >
                  <Collapse in={expandedRow === entity} timeout="auto" unmountOnExit>
                    <ExpandedRowContent
                      entity={entity}
                      racerType={racerType}
                      raceData={raceData}
                      isDark={isDark}
                    />
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default PositionStatTable;