import React, { useState } from "react";
import {
    Paper, Box, ToggleButtonGroup, ToggleButton, FormControl, InputLabel, Select, MenuItem, ListSubheader
  } from "@mui/material";
import { loadJsonData, getManySeasonData } from "../../utils/dataLoader";
import OverviewStatTable from "./OverviewStatTable";
import PointsStatTable from "./PointsStatTable";
import PositionStatTable from "./PositionStatTable";
import FightStatTable from "./FightStatTable";
import TeamStatsComparison from "./DriverVsTeam";


const trackTypes = loadJsonData("track_types.json");

const DetailedStats = ({ seasonYear, showAllYears, themeMode, onDriverClick }) => {
    const [tableMode, setTableMode] = useState("overview"); // options: points, positions, fight
    const [statsLevel, setStatsLevel] = useState("driver"); // options: driver, team, manufacturer
    const [trackFilter, setTrackFilter] = useState("all"); // New state for track filter

    const isDark = themeMode["themeMode"] === "dark";

    const rawData = getManySeasonData("race", 2022);

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
    const trackTypeEntries = Object.entries(trackTypes);

    return (
        <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3 }}>

          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Box>
                <ToggleButtonGroup
                        value={tableMode}
                        exclusive
                        onChange={(e, newMode) => newMode && setTableMode(newMode)}
                        size="small"
                        sx={{ mt: 1 }}
                        >
                    <ToggleButton value="overview">Overview</ToggleButton>
                    <ToggleButton value="points">Points</ToggleButton>
                    <ToggleButton value="positions">Positions</ToggleButton>
                    <ToggleButton value="fight">Fight</ToggleButton>
                    <ToggleButton value="driver_team">Driver vs Team</ToggleButton>
                </ToggleButtonGroup>
            </Box>

            <Box display="flex" gap={2}>
                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="track-filter-label">Track Filter</InputLabel>
                    <Select
                        labelId="track-filter-label"
                        value={trackFilter}
                        label="Track Filter"
                        onChange={(e) => setTrackFilter(e.target.value)}
                    >
                        <MenuItem value="all">All Tracks</MenuItem>
                        <ListSubheader>Track Types</ListSubheader>
                        {trackTypeEntries.map(([type, tracks]) => (
                            <MenuItem key={`type_${type}`} value={`type_${type}`}>
                                {type}
                            </MenuItem>
                        ))}
                        <ListSubheader>Specific Tracks</ListSubheader>
                        {uniqueTracks.map(track => (
                            <MenuItem key={track} value={track}>
                                {track}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 160 }}>
                    <InputLabel id="stats-level-label">Stats Type</InputLabel>
                    <Select
                    labelId="stats-level-label"
                    value={statsLevel}
                    label="Stats Type"
                    onChange={(e) => setStatsLevel(e.target.value)}
                    >
                    <MenuItem value="driver">Driver</MenuItem>
                    <MenuItem value="team">Team</MenuItem>
                    <MenuItem value="manufacturer">Manufacturer</MenuItem>
                    </Select>
                </FormControl>
            </Box>
            </Box>

    
            { tableMode === "overview" &&
                <OverviewStatTable
                    racerType={statsLevel}
                    lastRaceData={lastRaceData}
                    raceData={raceData}
                    seasonYear={seasonYear}
                    isDark={isDark}
                />
            }
            { tableMode === "points" &&
                <PointsStatTable
                    racerType={statsLevel}
                    lastRaceData={lastRaceData}
                    raceData={raceData}
                    seasonYear={seasonYear}
                    prevSeasonData={prevSeasonData}
                    isDark={isDark}  
                />                 
            }
            { tableMode === "positions" &&
                <PositionStatTable
                    racerType={statsLevel}
                    lastRaceData={lastRaceData}
                    raceData={raceData}
                    seasonYear={seasonYear}
                    prevSeasonData={prevSeasonData}
                    isDark={isDark}
                    showAllYears={showAllYears}
                />                 
            }
            { tableMode === "fight" &&
                <FightStatTable
                    racerType={statsLevel}
                    lastRaceData={lastRaceData}
                    raceData={raceData}
                    seasonYear={seasonYear}
                    prevSeasonData={prevSeasonData}
                    isDark={isDark}
                    showAllYears={showAllYears}
                />                 
            }
            { tableMode === "driver_team" &&
                <TeamStatsComparison
                    raceData={raceData}
                    seasonYear={seasonYear}
                    isDark={isDark}
                />                 
            }
            </Paper>
    )           
};


export default DetailedStats;