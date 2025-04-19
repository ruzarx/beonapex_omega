import React, { useState, useMemo } from "react";
import { 
  Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
  Box, Typography, IconButton, Collapse 
} from "@mui/material";
import { getAvgValue, getEntities, compareAvgToAllDrivers } from "../../utils/statsCalculations";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { loadJsonData } from "../../utils/dataLoader";


const calendar = loadJsonData("calendar.json");


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
            pass_diff: 0,
            green_flag_passes: 0,
            green_flag_times_passed: 0,
            quality_passes: 0,
            total_cars: 0,
          });
        }
        
        const raceData = raceMap.get(raceKey);
        raceData.pass_diff += race.pass_diff || 0;
        raceData.green_flag_passes += race.green_flag_passes || 0;
        raceData.green_flag_times_passed += race.green_flag_times_passed || 0;
        raceData.quality_passes += race.quality_passes || 0;
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
          avg_pass_diff: (race.pass_diff / race.total_cars).toFixed(1),
          avg_green_flag_passes: (race.green_flag_passes / race.total_cars).toFixed(1),
          avg_green_flag_times_passed: (race.green_flag_times_passed / race.total_cars).toFixed(1),
          avg_quality_passes: (race.quality_passes / race.total_cars).toFixed(1),
        }));
    }
  }, [raceData, entity, racerType]);

  const playoffLabelMap = {
    playoff_16: 'Round 16',
    playoff_12: 'Round 12',
    playoff_8:  'Round 8',
    playoff_4:  'Final'
  };

  return (
    <Box sx={{ margin: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Last 10 Races
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle}>Race</TableCell>
            <TableCell sx={headerCellStyle}>Pass Balance</TableCell>
            <TableCell sx={headerCellStyle}>Green Flag Passes</TableCell>
            <TableCell sx={headerCellStyle}>Green Flag Passed</TableCell>
            <TableCell sx={headerCellStyle}>Top-15 Passes</TableCell>
            <TableCell sx={headerCellStyle}>% Top-15 Passes</TableCell>
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
              <TableCell sx={cellStyle}>{racerType === "driver" ? race.pass_diff : race.avg_pass_diff}</TableCell>
              <TableCell sx={cellStyle}>{racerType === "driver" ? race.green_flag_passes : race.avg_green_flag_passes}</TableCell>
              <TableCell sx={cellStyle}>{racerType === "driver" ? race.green_flag_times_passed : race.avg_green_flag_times_passed}</TableCell>
              <TableCell sx={cellStyle}>{racerType === "driver" ? race.quality_passes : race.avg_quality_passes}</TableCell>
              <TableCell sx={cellStyle}>
                {((racerType === "driver" ? race.quality_passes : parseFloat(race.avg_quality_passes)) /
                  (racerType === "driver" ? race.green_flag_passes : parseFloat(race.avg_green_flag_passes)) * 100).toFixed(1)}%
              </TableCell>
            </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

const FightStatTable = ({ racerType, lastRaceData, raceData, seasonYear, prevSeasonData, isDark, showAllYears }) => {
    const [sortKey, setSortKey] = useState("pass_diff");
    const [sortDirection, setSortDirection] = useState("desc");
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
      : (seasonYear?.toString() || "No year selected");

    const handleSort = (key) => {
      if (sortKey === key) {
        setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortKey(key);
        setSortDirection("desc");
      }
    };

    const rawEntities = getEntities(
      raceData, 
      racerType, 
      showAllYears ? null : seasonYear,
      "quality_passes", 
      false
    );

    const entities = useMemo(() => {
      const getValue = (entity) => {
        if (sortKey === "green_flag_passes" || sortKey === "green_flag_times_passed" || 
            sortKey === "quality_passes" || sortKey === "pass_diff" || sortKey === "pct_quality_passes") {
          return getAvgValue(raceData, entity, sortKey, racerType);
        } else if (sortKey === "compare_green_flag_passes" || sortKey === "compare_green_flag_times_passed") {
          return compareAvgToAllDrivers(raceData, entity, 
            sortKey.includes("passes") ? "green_flag_passes" : "green_flag_times_passed", racerType);
        }
        return 0;
      };

      return [...rawEntities].sort((a, b) => {
        const valA = getValue(a);
        const valB = getValue(b);
        return sortDirection === "asc" ? valA - valB : valB - valA;
      });
    }, [raceData, racerType, rawEntities, sortKey, sortDirection]);


    const applyZebraTint = (colorEven, colorOdd, index) => index % 2 === 0 ? colorEven : colorOdd;
    
    return (
        <TableContainer>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic", mt: 0.5 }}>
                Statistics on overtakes and passes — based on results for {yearRange}.
              </Typography>
            </Box>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "primary.main" }}>
                  <TableCell sx={headerCellStyle}/>
                  { racerType === "driver" && <TableCell sx={headerCellStyle}>Driver</TableCell>}
                  { racerType === "driver" && <TableCell sx={headerCellStyle}>#</TableCell>}
                  { racerType != "manufacturer" && <TableCell sx={headerCellStyle}>Team</TableCell>}
                  { racerType === "manufacturer" && <TableCell sx={headerCellStyle}>Make</TableCell>}
                  <TableCell onClick={() => handleSort("pass_diff")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Pass Balance</TableCell>
                  <TableCell onClick={() => handleSort("green_flag_passes")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Green Flag Passes</TableCell>
                  <TableCell onClick={() => handleSort("compare_green_flag_passes")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Passes To All Drivers</TableCell>
                  <TableCell onClick={() => handleSort("green_flag_times_passed")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Green Flag Passed</TableCell>
                  <TableCell onClick={() => handleSort("compare_green_flag_times_passed")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Passed To All Drivers</TableCell>
                  <TableCell onClick={() => handleSort("quality_passes")} sx={{...headerCellStyle, cursor: "pointer" }}>Avg Top-15 Passes</TableCell>
                  <TableCell onClick={() => handleSort("pct_quality_passes")} sx={{...headerCellStyle, cursor: "pointer" }}>% Top-15 Passes</TableCell>
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
                      { racerType === "driver" && <TableCell>{entity}</TableCell>}
                      { racerType === "driver" && (
                        <TableCell sx={{ ...cellStyle }}>
                          {(lastRaceData.length > 0 
                            ? lastRaceData.find((r) => r.driver_name === entity)?.car_number
                            : getLatestDriverInfo(entity)?.car_number
                          )}
                        </TableCell>
                      )}
                      { racerType === "driver" && (
                        <TableCell>
                          {(lastRaceData.length > 0 
                            ? lastRaceData.find((r) => r.driver_name === entity)?.team_name
                            : getLatestDriverInfo(entity)?.team_name
                          )}
                        </TableCell>
                      )}
                      { racerType !== "driver" && <TableCell>{entity}</TableCell>}
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "pass_diff", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "green_flag_passes", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{compareAvgToAllDrivers(raceData, entity, "green_flag_passes", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "green_flag_times_passed", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{compareAvgToAllDrivers(raceData, entity, "green_flag_times_passed", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "quality_passes", racerType)}</TableCell>
                      <TableCell sx={{ ...cellStyle }}>{getAvgValue(raceData, entity, "pct_quality_passes", racerType)}%</TableCell>
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
    )
};

export default FightStatTable;