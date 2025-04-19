import React from "react";
import { Drawer, Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { buildStatRow } from "../../utils/driverStats";
import { getSeasonData, getManySeasonData } from "../../utils/dataLoader";


const ResultsDriverDrawer = ({ driver, open, onClose, seasonYear, currentRace, raceName }) => {
    const allRaces = getManySeasonData("race", 2022).filter(r => r.driver_name === driver);
    const seasonRaces = getSeasonData("race", seasonYear);
    const currentRaceEntry = seasonRaces.find(r => r.race_number === currentRace);
    const driverSeasonRaces = seasonRaces.filter(r => r.driver_name === driver);
    const seasonRacesWithoutDriver = seasonRaces.filter(r => r.driver_name !== driver);
    
    const rows = [
        buildStatRow("Finish Position", "race_pos", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Qual Position", "quali_pos", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Mid Race Position", "mid_race_pos", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Avg Running Pos", "avg_pos", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Highest Position", "highest_pos", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Lowest Position", "lowest_pos", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Finish Points", "race_finish_points", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver), 
        buildStatRow("Stage Points", "race_stage_points", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Passes Difference", "pass_diff", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Green Flag Passes", "green_flag_passes", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Green Flag Times Passed", "green_flag_times_passed", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Quality Passes", "quality_passes", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Fastest Laps", "fastest_lap", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Top 15 Laps", "top_15_laps", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("% Top 15 Laps", "pct_top_15_laps", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Laps Led", "laps_led", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("% Laps Led", "pct_laps_led", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Driver Rating", "driver_rating", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Stage 1 Points", "stage_1_pts", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Stage 2 Points", "stage_2_pts", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
        buildStatRow("Stage 3 Points", "stage_3_pts", currentRaceEntry, driverSeasonRaces, allRaces, seasonRacesWithoutDriver),
      ];
    // Replace with real content later
    return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: "60vw", p: 2 }}>
        <Typography variant="h6" fontWeight="bold">
          {driver}
        </Typography>
        <Typography variant="body2">
          Season: {seasonYear}, Race: {currentRace}
        </Typography>
        <Typography variant="body2">
          {raceName}
        </Typography>

        {/* Your detailed race-related stats will go here */}
        <Box sx={{ mt: 2 }}>
          {/* Placeholder or table/chart component */}
          <TableContainer component={Paper}>
            <Table size="small">
                <TableHead>
                <TableRow>
                    <TableCell><strong>Stat</strong></TableCell>
                    <TableCell align="right"><strong>This Race</strong></TableCell>
                    <TableCell align="right"><strong>Season Avg</strong></TableCell>
                    <TableCell align="right"><strong>Overall Avg</strong></TableCell>
                    <TableCell align="right"><strong>Season Avg Other Drivers</strong></TableCell>
                </TableRow>
                </TableHead>
                <TableBody>
                {rows.map((row, idx) => (
                    <TableRow key={idx}>
                    <TableCell>{row.label}</TableCell>
                    <TableCell align="right">{row.current}</TableCell>
                    <TableCell align="right">{row.seasonAvg}</TableCell>
                    <TableCell align="right">{row.overallAvg}</TableCell>
                    <TableCell align="right">{row.seasonRacesWithoutDriverAvg}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </Drawer>
  );
};

export default ResultsDriverDrawer;