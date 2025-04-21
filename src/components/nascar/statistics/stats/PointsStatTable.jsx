import React, { useState, useMemo, useEffect } from "react";
import { 
  Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
  Box, Typography, IconButton, Collapse, CircularProgress
} from "@mui/material";
import { getAvgValue, compareSumToPrevSeason, getStagePointsPercentage, getEntities, getSumValue } from "../../utils/statsCalculations";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
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
        .slice(0, 10);
    } else {
      // For teams and manufacturers, aggregate by race
      const raceMap = new Map();
      
      races.forEach(race => {
        const raceKey = `${race.season_year}-${race.race_number}-${race.track_name}`;
        if (!raceMap.has(raceKey)) {
          raceMap.set(raceKey, {
            season_year: race.season_year,
            race_number: race.race_number,
            track_name: race.track_name,
            season_points: 0,
            race_playoff_points: 0,
            race_stage_points: 0,
            total_cars: 0,
          });
        }
        
        const raceData = raceMap.get(raceKey);
        raceData.season_points += race.season_points || 0;
        raceData.race_playoff_points += race.race_playoff_points || 0;
        raceData.race_stage_points += race.race_stage_points || 0;
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
          stage_points_pct: ((race.race_stage_points / (race.race_stage_points + race.season_points - race.race_playoff_points)) * 100).toFixed(1),
          avg_points: (race.season_points / race.total_cars).toFixed(1)
        }));
    }
  }, [raceData, entity, racerType, calendar]);

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
      <Typography variant="subtitle2" gutterBottom>Last 10 Races</Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle}>Race</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Race Points" : "Total Race Points"}</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Playoff Points" : "Total Playoff Points"}</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Stage Points" : "Total Stage Points"}</TableCell>
            <TableCell sx={headerCellStyle}>% Stage Points</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Points" : "Avg Points per Car"}</TableCell>
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
                <TableCell sx={cellStyle}>{race.season_points}</TableCell>
                <TableCell sx={cellStyle}>{race.race_playoff_points}</TableCell>
                <TableCell sx={cellStyle}>{race.race_stage_points}</TableCell>
                <TableCell sx={cellStyle}>{race.stage_points_pct}%</TableCell>
                <TableCell sx={cellStyle}>{racerType === "driver" ? (race.season_points + race.race_playoff_points) : race.avg_points}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

const getCurrentSeasonRaceCount = (data, year) => {
  return data.filter(r => r.season_year === year).length;
};

const PointsStatTable = ({racerType, lastRaceData, raceData, seasonYear, prevSeasonData, isDark}) => {
  const [sortKey, setSortKey] = useState("season_points");
  const [sortDirection, setSortDirection] = useState("desc");
  const [expandedRow, setExpandedRow] = useState(null);

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const rawEntities = getEntities(raceData, racerType, seasonYear, "season_points", false);

  // Move getValue outside of useMemo
  const getValue = (entity) => {
    if (
      sortKey === "season_points" ||
      sortKey === "race_playoff_points" ||
      sortKey === "race_stage_points"
    ) {
      return getSumValue(raceData, entity, sortKey, racerType);
    } else if (sortKey === "stage_points_pct") {
      return getStagePointsPercentage(raceData, entity, racerType);
    } else if (sortKey === "finish_pos_pct") {
      return 100 - getStagePointsPercentage(raceData, entity, racerType);
    } else if (sortKey === "avg_season_points") {
      return getAvgValue(raceData, entity, "season_points", racerType);
    } else if (sortKey === "diff_to_prev") {
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

      return compareSumToPrevSeason(
        currentSeasonData, 
        prevSeasonLimitedData, 
        entity, 
        "season_points", 
        racerType
      );
    }
    return 0;
  };

  const entities = useMemo(() => {
    return [...rawEntities].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [rawEntities, sortKey, sortDirection, raceData, racerType, prevSeasonData, seasonYear]);

  const applyZebraTint = (colorEven, colorOdd, index) =>
    index % 2 === 0 ? colorEven : colorOdd;


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
    : (seasonYear?.toString() || "No year selected");

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

  return (
    <TableContainer>
      <Box mb={2}>
        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mt: 0.5 }}>
          Statistics on season and playoff points — based on results for {yearRange}.
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
            <TableCell onClick={() => handleSort("season_points")} sx={{...headerCellStyle, cursor: "pointer" }}>Season Points</TableCell>
            <TableCell onClick={() => handleSort("race_playoff_points")} sx={{...headerCellStyle, cursor: "pointer" }}>Playoff Points</TableCell>
            <TableCell onClick={() => handleSort("race_stage_points")} sx={{...headerCellStyle, cursor: "pointer" }}>Stage Points</TableCell>
            <TableCell onClick={() => handleSort("stage_points_pct")} sx={{...headerCellStyle, cursor: "pointer" }}>% Stage Points</TableCell>
            <TableCell onClick={() => handleSort("finish_pos_pct")} sx={{...headerCellStyle, cursor: "pointer" }}>% Finish Pos Points</TableCell>
            <TableCell onClick={() => handleSort("avg_season_points")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Race Points</TableCell>
            <TableCell onClick={() => handleSort("diff_to_prev")} sx={{...headerCellStyle, cursor: "pointer" }}>Points Diff To Previous Season</TableCell>
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
                  <IconButton
                    size="small"
                    onClick={() => setExpandedRow(expandedRow === entity ? null : entity)}
                  >
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
                  <TableCell sx={cellStyle}>
                    {(lastRaceData.length > 0 
                      ? lastRaceData.find((r) => r.driver_name === entity)?.team_name
                      : getLatestDriverInfo(entity)?.team_name
                    )}
                  </TableCell>
                )}
                {racerType !== "driver" && <TableCell sx={{...cellStyle, textAlign: 'left'}}>{entity}</TableCell>}
                <TableCell sx={cellStyle}>{getSumValue(raceData, entity, "season_points", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{getSumValue(raceData, entity, "race_playoff_points", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{getSumValue(raceData, entity, "race_stage_points", racerType)}</TableCell>
                <TableCell sx={cellStyle}>{getStagePointsPercentage(raceData, entity, racerType)}%</TableCell>
                <TableCell sx={cellStyle}>{100 - getStagePointsPercentage(raceData, entity, racerType)}%</TableCell>
                <TableCell sx={cellStyle}>{getAvgValue(raceData, entity, "season_points", racerType)}</TableCell>
                <TableCell sx={cellStyle}>
                  {compareSumToPrevSeason(raceData, prevSeasonData, entity, "season_points", racerType)}
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={11}>
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

export default PointsStatTable;