// New version: TeamStatsComparison.js
import React, { useState, useMemo, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  Paper
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { loadJsonData } from "../../utils/dataLoaderAsync";

const TeamStatsComparison = ({ raceData, prevSeasonData, lastRaceData, themeMode, onDriverClick }) => {
  const [expandedTeams, setExpandedTeams] = useState({});
  const [entryList, setEntryList] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await loadJsonData("entry_list.json");
        setEntryList(data);
      } catch (error) {
        console.error("Error loading entry list:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const isDark = themeMode["themeMode"] === "dark";

  const groupedByTeam = useMemo(() => {
    if (!entryList) return new Map();
    
    const map = new Map();
    raceData
      .filter(entry => entryList[entry.season_year]?.includes(entry.driver_name))
      .forEach(entry => {
        if (!map.has(entry.team_name)) map.set(entry.team_name, []);
        map.get(entry.team_name).push(entry);
      });
    return map;
  }, [raceData, entryList]);

  const computeStats = (entries) => {
    if (entries.length === 0) return null;
    const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length;
    return {
      avgFinish: avg(entries.map(e => e.race_pos)).toFixed(1),
      avgStart: avg(entries.map(e => e.quali_pos)).toFixed(1),
      avgRating: avg(entries.map(e => e.driver_rating || 0)).toFixed(1),
      avgRunning: avg(entries.map(e => e.avg_pos || 0)).toFixed(1),
      avgPasses: avg(entries.map(e => (e.quality_passes || 0) - (e.passes_made || 0))).toFixed(1)
    };
  };

  const toggleExpand = (team) => {
    setExpandedTeams(prev => ({ ...prev, [team]: !prev[team] }));
  };

  const applyZebraTint = (index) =>
    index % 2 === 0 ? (isDark ? "#1e1e1e" : "#fff") : (isDark ? "#2a2a2a" : "#f9f9f9");

  const teamRowStyle = (index) => ({
    bgcolor: isDark ? "#1a1a1a" : "#f0f0f0",
    fontWeight: 600,
    borderTop: index !== 0 ? `2px solid ${isDark ? '#333' : '#ccc'}` : undefined
  });

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

  if (isLoading || !entryList) {
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
    <TableContainer component={Paper}>
      <Typography variant="h6" p={2}>
        Driver Impact on Team Performance
        <Typography
          variant="body2"
          component="div"
          sx={{
            mt: 0.5,
            color: isDark ? '#aaaaaa' : '#666666',
            fontStyle: 'italic',
            fontSize: '0.8rem'
          }}
        >
          View each team's average stats and how they would change if a specific driver were excluded.
        </Typography>
      </Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerCellStyle}/>
            <TableCell sx={headerCellStyle}>Team</TableCell>
            <TableCell sx={headerCellStyle}>Avg Finish Position</TableCell>
            <TableCell sx={headerCellStyle}>Avg Start Position</TableCell>
            <TableCell sx={headerCellStyle}>Avg Rating</TableCell>
            <TableCell sx={headerCellStyle}>Avg Running Position</TableCell>
            <TableCell sx={headerCellStyle}>Passes Balance</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Array.from(groupedByTeam.entries()).map(([team, entries], index) => {
            const stats = computeStats(entries);
            return (
              <React.Fragment key={team}>
                <TableRow sx={teamRowStyle(index)}>
                  <TableCell>
                    <IconButton size="small" onClick={() => toggleExpand(team)}>
                      {expandedTeams[team] !== false ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                  </TableCell>
                  <TableCell sx={cellStyle}>{team}</TableCell>
                  <TableCell sx={cellStyle}>{stats ? stats.avgFinish : '-'}</TableCell>
                  <TableCell sx={cellStyle}>{stats ? stats.avgStart : '-'}</TableCell>
                  <TableCell sx={cellStyle}>{stats ? stats.avgRating : '-'}</TableCell>
                  <TableCell sx={cellStyle}>{stats ? stats.avgRunning : '-'}</TableCell>
                  <TableCell sx={cellStyle}>{stats ? stats.avgPasses : '-'}</TableCell>
                </TableRow>
                {expandedTeams[team] !== false && (
                  [...new Set(entries.map(e => e.driver_name))].map((driver, dIndex) => {
                    const filteredEntries = entries.filter(e => e.driver_name !== driver);
                    const dStats = computeStats(filteredEntries);
                    return (
                      <TableRow
                        key={driver}
                        sx={{ cursor: 'default', bgcolor: applyZebraTint(dIndex) }}
                      >
                        <TableCell colSpan={2} sx={{ ...cellStyle, textAlign: 'left', pl: 4 }}>
                            <span>{driver}</span>
                            <span style={{
                                marginLeft: 6,
                                fontStyle: 'italic',
                                color: isDark ? '#bbbbbb' : '#666666',
                                fontSize: '0.8rem'
                            }}>
                                (excluded)
                            </span>
                            </TableCell>
                        <TableCell sx={cellStyle}>{dStats ? dStats.avgFinish : '-'}</TableCell>
                        <TableCell sx={cellStyle}>{dStats ? dStats.avgStart : '-'}</TableCell>
                        <TableCell sx={cellStyle}>{dStats ? dStats.avgRating : '-'}</TableCell>
                        <TableCell sx={cellStyle}>{dStats ? dStats.avgRunning : '-'}</TableCell>
                        <TableCell sx={cellStyle}>{dStats ? dStats.avgPasses : '-'}</TableCell>
                      </TableRow>
                    );
                  })
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TeamStatsComparison;