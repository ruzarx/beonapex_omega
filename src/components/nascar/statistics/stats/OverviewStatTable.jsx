import React, { useState, useMemo, useEffect } from "react";
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
  IconButton,
  Paper
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  getAvgValue,
  getPercentage,
  getStagePointsPercentage,
  getEntities,
} from "../../utils/statsCalculations";
import { loadJsonData } from "../../utils/dataLoaderAsync";

// Update the ExpandedRowContent component
const ExpandedRowContent = ({ entity, statsLevel, raceData, themeMode }) => {
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

  const isDark = themeMode["themeMode"] === "dark";

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
    if (!calendar) return [];
    
    const races = raceData.filter(r => 
      r[statsLevel === "driver" ? "driver_name" : 
         statsLevel === "team" ? "team_name" : "manufacturer"] === entity
    );

    if (statsLevel === "driver") {
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
  }, [raceData, entity, statsLevel, calendar]);

  if (isLoading || !calendar) {
    return (
      <Box sx={{ margin: 1 }}>
        <Typography>Loading...</Typography>
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
            <TableCell sx={headerCellStyle}>{statsLevel === "driver" ? "Finish" : "Avg Finish"}</TableCell>
            <TableCell sx={headerCellStyle}>{statsLevel === "driver" ? "Start" : "Avg Start"}</TableCell>
            <TableCell sx={headerCellStyle}>{statsLevel === "driver" ? "Status" : "% Finished"}</TableCell>
            <TableCell sx={headerCellStyle}>{statsLevel === "driver" ? "Stage Points" : "Total Stage Points"}</TableCell>
            <TableCell sx={headerCellStyle}>{statsLevel === "driver" ? "Rating" : "Avg Rating"}</TableCell>
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
                <TableCell sx={cellStyle}>{statsLevel === "driver" ? race.race_pos : race.race_pos}</TableCell>
                <TableCell sx={cellStyle}>{statsLevel === "driver" ? race.quali_pos : race.quali_pos}</TableCell>
                <TableCell sx={cellStyle}>{statsLevel === "driver" ? race.status : `${race.finish_percentage}%`}</TableCell>
                <TableCell sx={cellStyle}>{statsLevel === "driver" ? race.race_stage_points : race.race_stage_points}</TableCell>
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
  raceData,
  prevSeasonData,
  lastRaceData,
  statsLevel,
  themeMode,
  onDriverClick
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
    statsLevel, 
    null, 
    "driver_rating", 
    false
  );

  const entities = useMemo(() => {
    const getValue = (entity) => {
      if (sortKey === "stage_points_pct") {
        return getStagePointsPercentage(raceData, entity, statsLevel);
      } else if (sortKey === "finish_pct") {
        return getPercentage(raceData, entity, "status", "finished", statsLevel);
      } else {
        return getAvgValue(raceData, entity, sortKey, statsLevel);
      }
    };

    return [...rawEntities].sort((a, b) => {
      const valA = getValue(a);
      const valB = getValue(b);
      return sortDirection === "asc" ? valA - valB : valB - valA;
    });
  }, [raceData, statsLevel, rawEntities, sortKey, sortDirection]);

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
    : years[0]?.toString() || "";

  const isDark = themeMode["themeMode"] === "dark";

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
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle} />
            <TableCell sx={headerCellStyle} onClick={() => handleSort("name")}>
              {statsLevel === "driver" ? "Driver" : statsLevel === "team" ? "Team" : "Manufacturer"}
            </TableCell>
            <TableCell sx={headerCellStyle} onClick={() => handleSort("race_pos")}>
              Avg Finish
            </TableCell>
            <TableCell sx={headerCellStyle} onClick={() => handleSort("quali_pos")}>
              Avg Start
            </TableCell>
            <TableCell sx={headerCellStyle} onClick={() => handleSort("finish_pct")}>
              Finish %
            </TableCell>
            <TableCell sx={headerCellStyle} onClick={() => handleSort("stage_points_pct")}>
              Stage Points %
            </TableCell>
            <TableCell sx={headerCellStyle} onClick={() => handleSort("driver_rating")}>
              Rating
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {entities.map((entity, index) => {
            const latestInfo = statsLevel === "driver" ? getLatestDriverInfo(entity) : null;
            const isExpanded = expandedRow === entity;

            return (
              <React.Fragment key={entity}>
                <TableRow
                  sx={{
                    cursor: "pointer",
                    bgcolor: applyZebraTint(
                      isDark ? "#1e1e1e" : "#fff",
                      isDark ? "#2a2a2a" : "#f9f9f9",
                      index
                    ),
                  }}
                  onClick={() => setExpandedRow(isExpanded ? null : entity)}
                >
                  <TableCell>
                    <IconButton size="small">
                      {isExpanded ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {statsLevel === "driver" && latestInfo ? (
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onDriverClick(entity);
                        }}
                      >
                        <span>{entity}</span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: isDark ? "#bbbbbb" : "#666666",
                          }}
                        >
                          #{latestInfo.car_number}
                        </span>
                      </Box>
                    ) : (
                      entity
                    )}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {(() => {
                      const value = getAvgValue(raceData, entity, "race_pos", statsLevel);
                      return typeof value === 'number' ? value.toFixed(1) : '-';
                    })()}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {(() => {
                      const value = getAvgValue(raceData, entity, "quali_pos", statsLevel);
                      return typeof value === 'number' ? value.toFixed(1) : '-';
                    })()}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {(() => {
                      const value = getPercentage(raceData, entity, "status", "finished", statsLevel);
                      return typeof value === 'number' ? `${value.toFixed(1)}%` : '-';
                    })()}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {(() => {
                      const value = getStagePointsPercentage(raceData, entity, statsLevel);
                      return typeof value === 'number' ? `${value.toFixed(1)}%` : '-';
                    })()}
                  </TableCell>
                  <TableCell sx={cellStyle}>
                    {(() => {
                      const value = getAvgValue(raceData, entity, "driver_rating", statsLevel);
                      return typeof value === 'number' ? value.toFixed(1) : '-';
                    })()}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ paddingBottom: 0, paddingTop: 0 }}
                    colSpan={7}
                  >
                    <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                      <ExpandedRowContent
                        entity={entity}
                        statsLevel={statsLevel}
                        raceData={raceData}
                        themeMode={themeMode}
                      />
                    </Collapse>
                  </TableCell>
                </TableRow>
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default OverviewStatTable;