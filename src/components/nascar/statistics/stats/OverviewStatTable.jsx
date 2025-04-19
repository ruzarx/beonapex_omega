import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  TableCell,
  Box,
  Typography,
  Collapse,
  IconButton
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  getAvgValue,
  getPercentage,
  getStagePointsPercentage,
  getEntities,
} from "../../utils/statsCalculations";
import { loadJsonData } from "../../utils/dataLoader";

const calendar = loadJsonData("calendar.json");


// Update the ExpandedRowContent component
const ExpandedRowContent = ({ entity, racerType, raceData, isDark }) => {

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

  const entityRaces = useMemo(() => {
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
            race_positions: [],
            quali_positions: [],
            finished_count: 0,
            total_cars: 0,
            race_stage_points: 0,
            driver_ratings: [],
          });
        }
        
        const raceData = raceMap.get(raceKey);
        raceData.race_positions.push(race.race_pos);
        raceData.quali_positions.push(race.quali_pos);
        if (race.status === "finished") raceData.finished_count++;
        raceData.total_cars++;
        raceData.race_stage_points += race.race_stage_points || 0;
        if (race.driver_rating) raceData.driver_ratings.push(race.driver_rating);
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
          finish_percentage: ((race.finished_count / race.total_cars) * 100).toFixed(1),
          driver_rating: race.driver_ratings.length > 0 
            ? (race.driver_ratings.reduce((a, b) => a + b, 0) / race.driver_ratings.length).toFixed(2)
            : "-"
        }));
    }
  }, [raceData, entity, racerType]);

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
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Status" : "% Finished"}</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Stage Points" : "Total Stage Points"}</TableCell>
            <TableCell sx={headerCellStyle}>{racerType === "driver" ? "Rating" : "Avg Rating"}</TableCell>
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
              <TableCell sx={cellStyle}>{racerType === "driver" ? race.race_pos : race.race_pos}</TableCell>
              <TableCell sx={cellStyle}>{racerType === "driver" ? race.quali_pos : race.quali_pos}</TableCell>
              <TableCell sx={cellStyle}>{racerType === "driver" ? race.status : `${race.finish_percentage}%`}</TableCell>
              <TableCell sx={cellStyle}>{racerType === "driver" ? race.race_stage_points : race.race_stage_points}</TableCell>
              <TableCell sx={cellStyle}>{race.driver_rating}</TableCell>
            </TableRow>
          );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

const OverviewStatTable = ({
  racerType,
  lastRaceData,
  raceData,
  seasonYear,
  isDark,
  showAllYears,
}) => {
  const [sortKey, setSortKey] = useState("race_pos");
  const [sortDirection, setSortDirection] = useState("asc");
  const [expandedRow, setExpandedRow] = useState(null);

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
    "driver_rating", 
    false
  );

  const entities = useMemo(() => {
    const getValue = (entity) => {
      if (sortKey === "stage_points_pct") {
        return getStagePointsPercentage(raceData, entity, racerType);
      } else if (sortKey === "finish_pct") {
        return getPercentage(raceData, entity, "status", "finished", racerType);
      } else {
        return getAvgValue(raceData, entity, sortKey, racerType);
      }
    };

    return [...rawEntities].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [raceData, racerType, rawEntities, sortKey, sortDirection]);

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
    : seasonYear.toString();

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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontStyle: "italic", mt: 0.5 }}
        >
          Overview of driver and team statistics — based on results for {yearRange}.
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
            <TableCell onClick={() => handleSort("race_pos")} sx={{...headerCellStyle, cursor: "pointer"}}>Average Finish</TableCell>
            <TableCell onClick={() => handleSort("quali_pos")} sx={{...headerCellStyle, cursor: "pointer"}}>Average Start</TableCell>
            <TableCell onClick={() => handleSort("finish_pct")}sx={{...headerCellStyle, cursor: "pointer"}}>% Finished Races</TableCell>
            <TableCell onClick={() => handleSort("stage_points_pct")} sx={{...headerCellStyle, cursor: "pointer"}}>% Stage Points</TableCell>
            <TableCell onClick={() => handleSort("driver_rating")} sx={{...headerCellStyle, cursor: "pointer"}}>Avg Rating</TableCell>
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
                    {expandedRow === entity ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                {racerType === "driver" && <TableCell sx={{...cellStyle, textAlign: 'left'}}>{entity}</TableCell>}
                {racerType === "driver" && (<TableCell sx={cellStyle}>{(lastRaceData.length > 0 
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
                <TableCell sx={cellStyle}>{getPercentage(raceData, entity, "status", "finished", racerType)}%</TableCell>
                <TableCell sx={cellStyle}>{getStagePointsPercentage(raceData, entity, racerType)}%</TableCell>
                <TableCell sx={cellStyle}>{getAvgValue(raceData, entity, "driver_rating", racerType)}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
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

export default OverviewStatTable;