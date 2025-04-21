import React, { useState, useEffect } from "react";
import {
    Paper, Box, ToggleButtonGroup, ToggleButton, FormControl, InputLabel, Select, MenuItem, ListSubheader, Typography, Stack
  } from "@mui/material";
import { loadJsonData, getManySeasonData } from "../../utils/dataLoaderAsync";
import OverviewStatTable from "./OverviewStatTable";
import PointsStatTable from "./PointsStatTable";
import PositionStatTable from "./PositionStatTable";
import FightStatTable from "./FightStatTable";
import TeamStatsComparison from "./DriverVsTeam";

const DetailedStats = ({ seasonYear, showAllYears, themeMode, onDriverClick }) => {
    const [tableMode, setTableMode] = useState("overview"); // options: points, positions, fight
    const [statsLevel, setStatsLevel] = useState("driver"); // options: driver, team, manufacturer
    const [trackFilter, setTrackFilter] = useState("all"); // New state for track filter
    const [trackTypes, setTrackTypes] = useState(null);
    const [rawData, setRawData] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const [types, data] = await Promise.all([
                    loadJsonData("track_types.json"),
                    getManySeasonData("race", seasonYear)
                ]);
                setTrackTypes(types);
                setRawData(data);
            } catch (error) {
                console.error("Error loading data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [seasonYear]);

    const isDark = themeMode["themeMode"] === "dark";

    const filterDataByTrack = (data) => {
        if (trackFilter === "all") return data;
        
        if (trackFilter.startsWith("type_")) {
            const trackType = trackFilter.replace("type_", "");
            const tracksInType = trackTypes[trackType] || [];
            return data.filter(r => tracksInType.includes(r.track_name));
        }
        return data.filter(r => r.track_name === trackFilter);
    };

    const filteredData = showAllYears
        ? rawData 
        : rawData.filter(r => r.season_year === seasonYear);

    const raceData = filterDataByTrack(filteredData);
    const prevSeasonData = showAllYears 
        ? [] 
        : filterDataByTrack(rawData.filter(r => r.season_year === seasonYear - 1));
    const lastRaceData = showAllYears 
        ? [] 
        : filterDataByTrack(rawData.filter(r => r.season_year === seasonYear));

    const uniqueTracks = [...new Set(rawData.map(r => r.track_name))];
    const trackTypeEntries = Object.entries(trackTypes || {});

    if (isLoading || !trackTypes) {
        return (
            <Paper
                elevation={0}
                sx={{
                    backdropFilter: "blur(10px)",
                    background: "linear-gradient(135deg, rgba(0,128,255,0.15), rgba(255,255,255,0.05))",
                    borderRadius: 4,
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                    boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                    p: 3,
                }}
            >
                <Typography>Loading...</Typography>
            </Paper>
        );
    }

    return (
        <Paper
            elevation={0}
            sx={{
                backdropFilter: "blur(10px)",
                background: "linear-gradient(135deg, rgba(0,128,255,0.15), rgba(255,255,255,0.05))",
                borderRadius: 4,
                border: "1px solid rgba(255, 255, 255, 0.1)",
                boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
                p: 3,
            }}
        >
            <Stack spacing={3}>
                <Box>
                    <ToggleButtonGroup
                        value={tableMode}
                        exclusive
                        onChange={(e, newMode) => {
                            if (newMode !== null && newMode !== tableMode) {
                                setTableMode(newMode);
                            }
                        }}
                        size="small"
                        color="primary"
                        fullWidth
                    >
                        <ToggleButton value="overview">Overview</ToggleButton>
                        <ToggleButton value="points">Points</ToggleButton>
                        <ToggleButton value="positions">Positions</ToggleButton>
                        <ToggleButton value="fight">Fight</ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                <Box>
                    <FormControl fullWidth size="small">
                        <InputLabel>Stats Level</InputLabel>
                        <Select
                            value={statsLevel}
                            label="Stats Level"
                            onChange={(e) => setStatsLevel(e.target.value)}
                        >
                            <MenuItem value="driver">Driver</MenuItem>
                            <MenuItem value="team">Team</MenuItem>
                            <MenuItem value="manufacturer">Manufacturer</MenuItem>
                        </Select>
                    </FormControl>
                </Box>

                <Box>
                    <FormControl fullWidth size="small">
                        <InputLabel>Track Filter</InputLabel>
                        <Select
                            value={trackFilter}
                            label="Track Filter"
                            onChange={(e) => setTrackFilter(e.target.value)}
                        >
                            <MenuItem value="all">All Tracks</MenuItem>
                            <ListSubheader>Track Types</ListSubheader>
                            {trackTypeEntries.map(([type, tracks]) => (
                                <MenuItem key={type} value={`type_${type}`}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </MenuItem>
                            ))}
                            <ListSubheader>Individual Tracks</ListSubheader>
                            {uniqueTracks.map((track) => (
                                <MenuItem key={track} value={track}>
                                    {track}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>

                {tableMode === "overview" && (
                    <OverviewStatTable
                        raceData={raceData}
                        prevSeasonData={prevSeasonData}
                        lastRaceData={lastRaceData}
                        statsLevel={statsLevel}
                        themeMode={themeMode}
                        onDriverClick={onDriverClick}
                    />
                )}

                {tableMode === "points" && (
                    <PointsStatTable
                        raceData={raceData}
                        prevSeasonData={prevSeasonData}
                        lastRaceData={lastRaceData}
                        statsLevel={statsLevel}
                        themeMode={themeMode}
                        onDriverClick={onDriverClick}
                    />
                )}

                {tableMode === "positions" && (
                    <PositionStatTable
                        raceData={raceData}
                        prevSeasonData={prevSeasonData}
                        lastRaceData={lastRaceData}
                        statsLevel={statsLevel}
                        themeMode={themeMode}
                        onDriverClick={onDriverClick}
                    />
                )}

                {tableMode === "fight" && (
                    <FightStatTable
                        raceData={raceData}
                        prevSeasonData={prevSeasonData}
                        lastRaceData={lastRaceData}
                        statsLevel={statsLevel}
                        themeMode={themeMode}
                        onDriverClick={onDriverClick}
                    />
                )}

                {statsLevel === "driver" && (
                    <TeamStatsComparison
                        raceData={raceData}
                        prevSeasonData={prevSeasonData}
                        lastRaceData={lastRaceData}
                        themeMode={themeMode}
                        onDriverClick={onDriverClick}
                    />
                )}
            </Stack>
        </Paper>
    );
};

export default DetailedStats;