import React, { useMemo, useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from "@mui/material";
import { loadJsonData, getTrackData } from "../../utils/dataLoaderAsync";

const TrackHistoryTable = () => {
  const [nextRaceData, setNextRaceData] = useState(null);
  const [trackRaces, setTrackRaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const favoriteDriver = "Ross Chastain";

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const nextRace = await loadJsonData("next_race_data.json");
        setNextRaceData(nextRace);

        const track = nextRace.next_race_track;
        const races = await getTrackData(2022, track, "exact");
        setTrackRaces(races.filter(r => r.driver_name === favoriteDriver));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const rows = useMemo(() => {
    if (!trackRaces.length) return [];

    return trackRaces
      .sort((a, b) => b.race_date - a.race_date)
      .map(r => ({
        year: r.season_year,
        race: `Race ${r.race_number}`,
        start: r.start_pos,
        finish: r.race_pos,
        avg: r.avg_pos?.toFixed(1),
        rating: r.driver_rating?.toFixed(1),
        stage_pts: (r.stage_1_pts || 0) + (r.stage_2_pts || 0) + (r.stage_3_pts || 0),
        status: r.status,
      }));
  }, [trackRaces]);

  if (isLoading || !nextRaceData) {
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

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No history available for this track.
      </Typography>
    );
  }

  return (
    <TableContainer component={Paper} elevation={0} sx={{ 
      backdropFilter: "blur(10px)",
      background: "linear-gradient(135deg, rgba(0,128,255,0.15), rgba(255,255,255,0.05))",
      borderRadius: 4,
      border: "1px solid rgba(255, 255, 255, 0.1)",
      boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
    }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Year</TableCell>
            <TableCell>Race</TableCell>
            <TableCell align="right">Start</TableCell>
            <TableCell align="right">Finish</TableCell>
            <TableCell align="right">Avg Pos</TableCell>
            <TableCell align="right">Rating</TableCell>
            <TableCell align="right">Stage Pts</TableCell>
            <TableCell align="right">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow
              key={`${row.year}-${row.race}`}
              sx={{
                '&:nth-of-type(odd)': {
                  backgroundColor: 'rgba(255, 255, 255, 0.02)',
                },
              }}
            >
              <TableCell component="th" scope="row">
                {row.year}
              </TableCell>
              <TableCell>{row.race}</TableCell>
              <TableCell align="right">{row.start}</TableCell>
              <TableCell align="right">{row.finish}</TableCell>
              <TableCell align="right">{row.avg}</TableCell>
              <TableCell align="right">{row.rating}</TableCell>
              <TableCell align="right">{row.stage_pts}</TableCell>
              <TableCell align="right">{row.status}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TrackHistoryTable;