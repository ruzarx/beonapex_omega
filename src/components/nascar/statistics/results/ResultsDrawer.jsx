import React, { useState, useEffect } from "react";
import { Drawer, Box, Typography, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { buildStatRow } from "../../utils/driverStats";
import { getSeasonData, getManySeasonData } from "../../utils/dataLoaderAsync";

const ResultsDriverDrawer = ({ driver, open, onClose, seasonYear, currentRace, raceName }) => {
    const [allRaces, setAllRaces] = useState([]);
    const [seasonRaces, setSeasonRaces] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [allRacesData, seasonRacesData] = await Promise.all([
                    getManySeasonData("race", 2022),
                    getSeasonData("race", seasonYear)
                ]);
                setAllRaces(allRacesData);
                setSeasonRaces(seasonRacesData);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        if (open) {
            loadData();
        }
    }, [open, seasonYear]);

    const currentRaceEntry = seasonRaces.find(r => r.race_number === currentRace);
    const driverSeasonRaces = seasonRaces.filter(r => r.driver_name === driver);
    const seasonRacesWithoutDriver = seasonRaces.filter(r => r.driver_name !== driver);
    const driverAllRaces = allRaces.filter(r => r.driver_name === driver);
    
    const rows = [
        buildStatRow("Finish Position", "race_pos", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Qual Position", "quali_pos", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Mid Race Position", "mid_race_pos", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Avg Running Pos", "avg_pos", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Highest Position", "highest_pos", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Lowest Position", "lowest_pos", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Finish Points", "race_finish_points", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver), 
        buildStatRow("Stage Points", "race_stage_points", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Passes Difference", "pass_diff", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Green Flag Passes", "green_flag_passes", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Green Flag Times Passed", "green_flag_times_passed", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Quality Passes", "quality_passes", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Fastest Laps", "fastest_lap", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Top 15 Laps", "top_15_laps", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("% Top 15 Laps", "pct_top_15_laps", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Laps Led", "laps_led", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("% Laps Led", "pct_laps_led", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Driver Rating", "driver_rating", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Stage 1 Points", "stage_1_pts", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Stage 2 Points", "stage_2_pts", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
        buildStatRow("Stage 3 Points", "stage_3_pts", currentRaceEntry, driverSeasonRaces, driverAllRaces, seasonRacesWithoutDriver),
    ];

    if (isLoading) {
        return (
            <Drawer anchor="right" open={open} onClose={onClose}>
                <Box sx={{ width: "60vw", p: 2 }}>
                    <Typography>Loading...</Typography>
                </Box>
            </Drawer>
        );
    }

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

                <Box sx={{ mt: 2 }}>
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