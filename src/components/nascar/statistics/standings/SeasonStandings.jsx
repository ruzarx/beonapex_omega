import {
  Paper, Table, TableBody, TableContainer, TableHead, TableRow, TableCell,
  TableSortLabel, Box, Typography, Tooltip, CircularProgress
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { getSeasonData } from "../../utils/dataLoaderAsync";
import { getStandings, getBestFinish } from "../../utils/standingsCalculations";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import Filter1Icon from '@mui/icons-material/Filter1';
import Filter2Icon from '@mui/icons-material/Filter2';
import Filter3Icon from '@mui/icons-material/Filter3';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';

const SeasonStandings = ({ seasonYear, currentRace, themeMode, onDriverClick }) => {
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

  const driverCarNumbers = Object.fromEntries(
    currentSeasonStandingsData.map(r => [r.driver_name, r.car_number])
  );

  const seasonPosMap = Object.fromEntries(
    allDrivers.map(driver => ({
      driver,
      points: getStandings(currentSeasonStandingsData, driver, "season_points")
    }))
      .sort((a, b) => b.points - a.points)
      .map(({ driver }, i) => [driver, i + 1])
  );

  const sortedDrivers = [...allDrivers].sort((a, b) => {
    const aVal = seasonPosMap[a];
    const bVal = seasonPosMap[b];
    return aVal - bVal;
  });

  const applyZebraTint = (colorEven, colorOdd, index) =>
    index % 2 === 0 ? colorEven : colorOdd;

  const getHighlight = (driver, index) => {
    const pos = seasonPosMap[driver];
    let highlightLimit = 20;
  
    if (currentRace >= 27 && currentRace <= 29) highlightLimit = 16;
    else if (currentRace >= 30 && currentRace <= 32) highlightLimit = 12;
    else if (currentRace >= 33 && currentRace <= 35) highlightLimit = 8;
    else if (currentRace === 36) highlightLimit = 4;
  
    if (highlightLimit && pos <= highlightLimit) {
      return applyZebraTint(
        isDark ? "#1e1e1e" : "#ffffff",
        isDark ? "#2a2a2a" : "#f9f9f9",
        index
      );
    }
  
    return undefined;
  };
  

  const driverWinsByStage = Object.fromEntries(
    allDrivers.map(driver => {
      const race = currentSeasonStandingsData.find(r => r.driver_name === driver);
      return [driver, {
        season: race?.season_wins || 0,
        round16: race?.playoff_16_wins || 0,
        round12: race?.playoff_12_wins || 0,
        round8: race?.playoff_8_wins || 0,
        championship: race?.champion ? 1 : 0,
      }];
    })
  );

  return (
    <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">Regular Season Standings</Typography>
      </Box>

      <TableContainer>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>
                <TableSortLabel active direction="asc">Season Pos</TableSortLabel>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold", px: 2 }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: "bold", px: 2 }}>#</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Season Points</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Wins</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Stage Points</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Stage Wins</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Playoff Points</TableCell>
              <TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Best Finish</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedDrivers.map((driver, index) => (
              <TableRow
                key={index}
                sx={{
                  bgcolor: getHighlight(driver, index),
                  height: 64,
                  "&:hover": { bgcolor: "action.selected", transition: "all 0.3s ease" },
                  cursor: "pointer"
                }}
                onClick={() => onDriverClick(driver)}
              >
                <TableCell sx={{ textAlign: "center", fontWeight: "bold" }}>{seasonPosMap[driver]}</TableCell>
                <TableCell sx={{ fontWeight: "bold", px: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography fontWeight="bold" noWrap>{driver}</Typography>
                    {driverWinsByStage[driver].season > 0 && (
                      <Tooltip title="Regular Season Wins">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <EmojiEventsIcon fontSize="small" color="primary" />
                          {driverWinsByStage[driver].season > 1 && (
                            <Typography variant="caption">x{driverWinsByStage[driver].season}</Typography>
                          )}
                        </Box>
                      </Tooltip>
                    )}
                    {driverWinsByStage[driver].round16 > 0 && (
                      <Tooltip title="Round of 16 Wins">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Filter1Icon fontSize="small" color="secondary" />
                          {driverWinsByStage[driver].round16 > 1 && (
                            <Typography variant="caption">x{driverWinsByStage[driver].round16}</Typography>
                          )}
                        </Box>
                      </Tooltip>
                    )}
                    {driverWinsByStage[driver].round12 > 0 && (
                      <Tooltip title="Round of 12 Wins">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Filter2Icon fontSize="small" color="secondary" />
                          {driverWinsByStage[driver].round12 > 1 && (
                            <Typography variant="caption">x{driverWinsByStage[driver].round12}</Typography>
                          )}
                        </Box>
                      </Tooltip>
                    )}
                    {driverWinsByStage[driver].round8 > 0 && (
                      <Tooltip title="Round of 8 Wins">
                        <Box display="flex" alignItems="center" gap={0.5}>
                          <Filter3Icon fontSize="small" color="secondary" />
                          {driverWinsByStage[driver].round8 > 1 && (
                            <Typography variant="caption">x{driverWinsByStage[driver].round8}</Typography>
                          )}
                        </Box>
                      </Tooltip>
                    )}
                    {driverWinsByStage[driver].championship > 0 && (
                      <Tooltip title="Championship Winner">
                        <MilitaryTechIcon fontSize="small" sx={{ color: 'gold' }} />
                      </Tooltip>
                    )}
                  </Box>
                </TableCell>

                <TableCell sx={{ width: "40px", fontWeight: "bold", px: 2 }}>
                  {driverCarNumbers[driver] || "-"}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {getStandings(currentSeasonStandingsData, driver, "season_points")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {getStandings(currentSeasonStandingsData, driver, "wins")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {getStandings(currentSeasonStandingsData, driver, "race_stage_points")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {getStandings(currentSeasonStandingsData, driver, "stage_wins")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {getStandings(currentSeasonStandingsData, driver, "race_playoff_points")}
                </TableCell>
                <TableCell sx={{ textAlign: "center" }}>
                  {getBestFinish(currentSeasonStandingsData, driver)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default SeasonStandings;