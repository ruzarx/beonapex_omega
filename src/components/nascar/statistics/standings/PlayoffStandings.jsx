import {
  Paper, Table, TableBody, TableContainer, TableHead, TableRow, TableCell, TableSortLabel, Chip, Avatar, Box, Typography, CircularProgress
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { getSeasonData } from "../../utils/dataLoaderAsync";
import { getStandings, getRoundWins } from "../../utils/standingsCalculations";

const PlayoffStandings = ({ seasonYear, currentRace, themeMode, onDriverClick }) => {
  const [standingsData, setStandingsData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = themeMode["themeMode"] === "dark";

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getSeasonData("standings", seasonYear);
        setStandingsData(data);
      } catch (error) {
        console.error("Error loading standings data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [seasonYear]);

  if (isLoading || !standingsData) {
    return (
      <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  const allDrivers = [...new Set(
    standingsData.filter(r => r.race_number <= currentRace).map(r => r.driver_name)
  )];
  const currentSeasonStandingsData = standingsData.filter(r => r.race_number === currentRace);
  const regularSeasonStandingsData = standingsData.filter(r => r.race_number === Math.min(currentRace, 26));
  const playoffSeasonStandingsData = standingsData.filter(r => r.race_number > 26 && r.race_number === currentRace);
  const round16StandingsData = standingsData.filter(r => r.race_number > 26 && r.race_number <= 29);
  const round12StandingsData = standingsData.filter(r => r.race_number > 29 && r.race_number <= 32);
  const round8StandingsData = standingsData.filter(r => r.race_number > 32 && r.race_number <= 35);
  const round4StandingsData = standingsData.filter(r => r.race_number === 36);

  const getCurrentRoundWinColumn = () => {
    if (currentRace >= 27 && currentRace <= 29) return "playoff_16_wins";
    if (currentRace >= 30 && currentRace <= 32) return "playoff_12_wins";
    if (currentRace >= 33 && currentRace <= 35) return "playoff_8_wins";
    if (currentRace === 36) return "champion";
    return []; // Not in playoffs
  };
  

  const driverCarNumbers = Object.fromEntries(
    currentSeasonStandingsData.map(r => [r.driver_name, r.car_number])
  );

  const regularSeasonLeader = (() => {
    const regularSeasonData = standingsData
      .filter(r => r.race_number <= Math.min(currentRace, 26))
      .filter(r => allDrivers.includes(r.driver_name));
  
    const lastRaceByDriver = {};
    regularSeasonData.forEach(r => {
      if (!lastRaceByDriver[r.driver_name] || r.race_number > lastRaceByDriver[r.driver_name].race_number) {
        lastRaceByDriver[r.driver_name] = r;
      }
    });
  
    const sorted = Object.entries(lastRaceByDriver)
      .map(([driver, row]) => ({ driver, points: row.season_points }))
      .sort((a, b) => b.points - a.points);
  
    return sorted[0]?.driver || null;
  })();
  

  const playoffPosMap = (() => {
    const getWins = driver => getRoundWins(currentSeasonStandingsData, driver, currentRace);
    const getPoints = driver => getStandings(currentSeasonStandingsData, driver, "season_points");

    const qualified = allDrivers.filter(driver =>
      currentSeasonStandingsData.find(r => r.driver_name === driver && r.wins > 0)
    );
    const nonQualified = allDrivers.filter(driver => !qualified.includes(driver));

    const sorted = [
      ...qualified.sort((a, b) => getWins(b) - getWins(a) || getPoints(b) - getPoints(a)),
      ...nonQualified.sort((a, b) => getPoints(b) - getPoints(a))
    ];

    return Object.fromEntries(sorted.map((driver, i) => [driver, i + 1]));
  })();

  const sortedDrivers = [...allDrivers].sort((a, b) => playoffPosMap[a] - playoffPosMap[b]);

  const bubbleCutoff =
    currentRace <= 26 ? 16 :
      currentRace <= 29 ? 12 :
        currentRace <= 32 ? 8 :
          currentRace <= 35 ? 4 :
            null;


            const applyZebraTint = (colorEven, colorOdd, index) =>
              index % 2 === 0 ? colorEven : colorOdd;
          
          
            const getHighlight = (driver, index) => {
              const row = currentSeasonStandingsData.find(r => r.driver_name === driver);
              const pos = playoffPosMap[driver];
          
              if (!row) return index % 2 === 0 ? "background.default" : "action.hover";
          
              // Champion
              if (row?.champion === 1) {
                return applyZebraTint(
                  isDark ? "#294842" : "#b2dfdb",
                  isDark ? "#243b36" : "#a5d6d5",
                  index
                );
              }
          
              const isLockedIn = row?.[`qualified_to_${bubbleCutoff}`] === 1 && row.wins > 0;
          
              // Locked-in
              if (isLockedIn) {
                return applyZebraTint(
                  isDark ? "#4e342e" : "#ffe0b2",
                  isDark ? "#3e2723" : "#ffd180",
                  index
                );
              }
          
              // Promoted
              if (pos <= bubbleCutoff) {
                return applyZebraTint(
                  isDark ? "#355635" : "#dcedc8",
                  isDark ? "#2a4430" : "#c8e6c9",
                  index
                );
              }
          
              // Just out
              if (pos <= bubbleCutoff + 4) {
                return applyZebraTint(
                  isDark ? "#5d2e35" : "#f8bbd0",
                  isDark ? "#4a2027" : "#f48fb1",
                  index
                );
              }
          
              // Default zebra
              return index % 2 === 0 ? "background.default" : "action.hover";
            };

  const getPlayoffPointsDelta = (driver) => {
    const row = currentSeasonStandingsData.find(r => r.driver_name === driver);
    const pos = playoffPosMap[driver];

    let winField = null;
    if (currentRace <= 26) winField = "season_wins";
    else if (currentRace <= 29) winField = "playoff_16_wins";
    else if (currentRace <= 32) winField = "playoff_12_wins";
    else if (currentRace <= 35) winField = "playoff_8_wins";
    else winField = "champion";

    const hasLockedInWin = winField && row?.[winField] > 0;

    if (winField === "champion" && hasLockedInWin) return "Champion";
    else if (winField === "champion") return "-";

    const isLockedIn = hasLockedInWin && pos <= bubbleCutoff;
    if (isLockedIn) return "Locked-in";

    const referenceDriver =
      pos <= bubbleCutoff
        ? sortedDrivers.find(d => playoffPosMap[d] === bubbleCutoff + 1)
        : sortedDrivers.find(d => playoffPosMap[d] === bubbleCutoff);

    const driverPoints = getStandings(currentSeasonStandingsData, driver, "season_points");
    const refPoints = getStandings(currentSeasonStandingsData, referenceDriver, "season_points");

    const diff = driverPoints - refPoints;
    return (diff > 0 ? "+" : "") + diff;
  };



  return (
    <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <h2 style={{ margin: 0 }}>Playoff Standings</h2>
      </div>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}><TableSortLabel>Playoff Pos</TableSortLabel></TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>Driver</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>#</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Gap To Bubble</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Season Wins</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Playoff Wins</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Round Wins</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center", cursor: "pointer" }}>Playoff Points</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedDrivers.map((driver, index) => {
              return (
                <TableRow
                  key={index}
                  sx={{
                    bgcolor: getHighlight(driver, index),
                    borderBottom: (playoffPosMap[driver] === bubbleCutoff) ? "3px solid #00000033" : undefined,
                    "&:hover": { bgcolor: "action.selected", transition: "all 0.3s ease" },
                    height: 64
                  }}
                  onClick={() => onDriverClick(driver)}
                >
                  <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{playoffPosMap[driver]}</TableCell>
                  <TableCell sx={{ px: 2, fontWeight: "bold" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography fontWeight="bold" noWrap>{driver}</Typography>

                      {driver === regularSeasonLeader && (
                        <Chip
                          label={currentRace <= 26 ? "Points Leader" : "Season Champion"}
                          size="small"
                          color="success"
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </TableCell>

                  <TableCell sx={{ width: "40px", fontWeight: "bold", px: 2 }}>{driverCarNumbers[driver] || "-"}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>
                    {getPlayoffPointsDelta(driver) === "Locked-in" ? (
                      <Chip label="Locked-in" color="warning" size="small" />
                    ) : (
                      getPlayoffPointsDelta(driver)
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{getStandings(regularSeasonStandingsData, driver, "wins")}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{(getStandings(currentSeasonStandingsData, driver, "playoff_16_wins") + getStandings(currentSeasonStandingsData, driver, "playoff_12_wins") + getStandings(currentSeasonStandingsData, driver, "playoff_8_wins") + getStandings(currentSeasonStandingsData, driver, "champion"))}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{getStandings(currentSeasonStandingsData, driver, getCurrentRoundWinColumn())}</TableCell>
                  <TableCell sx={{ textAlign: "center" }}>{getStandings(currentSeasonStandingsData, driver, "race_playoff_points")}</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default PlayoffStandings;
