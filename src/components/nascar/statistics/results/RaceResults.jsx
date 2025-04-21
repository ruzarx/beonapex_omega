import {
  Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Box, Typography, TableSortLabel, CircularProgress
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { getSeasonData } from "../../utils/dataLoaderAsync";

const RaceResults = ({ seasonYear, currentRace, themeMode, onDriverClick }) => {
  const isDark = themeMode["themeMode"] === "dark";
  const [sortColumn, setSortColumn] = useState("race_pos");
  const [sortDirection, setSortDirection] = useState("asc");
  const [currentResults, setCurrentResults] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const data = await getSeasonData("race", seasonYear, currentRace);
        setCurrentResults(data.filter(r => r.race_number === currentRace));
      } catch (error) {
        console.error("Error loading race results:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [seasonYear, currentRace]);

  const columnMap = {
    "Finish Pos": "race_pos",
    "Driver": "driver_name",
    "#": "car_number",
    "Team": "team_name",
    "Wins": "wins",
    "Start Pos": "quali_pos",
    "Stage 1 Pts": "stage_1_pts",
    "Stage 2 Pts": "stage_2_pts",
    "Quality Passes": "quality_passes",
    "Status": "status",
    "Avg Running Pos": "avg_pos",
    "Rating": "driver_rating"
  };

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  const sortedResults = [...currentResults].sort((a, b) => {
    const aValue = a[sortColumn];
    const bValue = b[sortColumn];

    if (aValue < bValue) return sortDirection === "asc" ? -1 : 1;
    if (aValue > bValue) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const applyZebraTint = (colorEven, colorOdd, index) =>
    index % 2 === 0 ? colorEven : colorOdd;

  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };

  if (isLoading) {
    return (
      <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={24} />
      </Paper>
    );
  }

  return (
    <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
        <Typography variant="h6" fontWeight="bold">Race Results</Typography>
      </Box>

      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main" }}>
              {[
                "Finish Pos", "Driver", "#", "Team", "Start Pos",
                "Stage 1 Pts", "Stage 2 Pts", "Quality Passes",
                "Status", "Avg Running Pos", "Rating"
              ].map((label) => (
                <TableCell key={label} sx={{ px: 1, py: 0.5, fontWeight: "bold", textAlign: "center" }}>
                  <TableSortLabel
                    active={sortColumn === columnMap[label]}
                    direction={sortColumn === columnMap[label] ? sortDirection : "asc"}
                    onClick={() => handleSort(columnMap[label])}
                  >
                    {label}
                  </TableSortLabel>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedResults.map((result, index) => (
              <TableRow
                key={index}
                sx={{
                  bgcolor: applyZebraTint(
                    isDark ? "#1e1e1e" : "#fff",
                    isDark ? "#2a2a2a" : "#f9f9f9",
                    index
                  ),
                  height: 32,
                  "&:hover": { bgcolor: "action.selected", transition: "all 0.3s ease" },
                  cursor: "pointer"
                }}
                onClick={() => onDriverClick(result.driver_name)}
              >
                <TableCell sx={cellStyle}>{result.race_pos}</TableCell>
                <TableCell sx={{ px: 1, py: 0.5, fontWeight: "bold" }}>{result.driver_name}</TableCell>
                <TableCell sx={cellStyle}>{result.car_number}</TableCell>
                <TableCell sx={cellStyle}>
                  <Typography
                    noWrap
                    sx={{
                      fontSize: "clamp(0.7rem, 1vw, 0.95rem)",
                      textOverflow: "ellipsis",
                      overflow: "hidden",
                      textAlign: "left",
                    }}
                  >
                    {result.team_name}
                  </Typography>
                </TableCell>
                <TableCell sx={cellStyle}>{result.quali_pos}</TableCell>
                <TableCell sx={cellStyle}>{result.stage_1_pts}</TableCell>
                <TableCell sx={cellStyle}>{result.stage_2_pts}</TableCell>
                <TableCell sx={cellStyle}>{result.quality_passes}</TableCell>
                <TableCell sx={cellStyle}>{result.status}</TableCell>
                <TableCell sx={cellStyle}>{result.avg_pos}</TableCell>
                <TableCell sx={cellStyle}>{result.driver_rating}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RaceResults;
