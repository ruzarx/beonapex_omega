import React, { useMemo } from "react";
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography, Paper } from "@mui/material";
import { loadJsonData, getTrackData } from "../../utils/dataLoader";

const nextRaceData = loadJsonData("next_race_data.json");

const TrackHistoryTable = () => {
  const favoriteDriver = "Ross Chastain";
  const track = nextRaceData.next_race_track;

  
  const rows = useMemo(() => {
    const filtered = getTrackData(2022, track, "exact").filter(r => r.driver_name === favoriteDriver);

    return filtered
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
  }, [favoriteDriver, track]);

  if (rows.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No history available for this track.
      </Typography>
    );
  }

  return (
    <Paper elevation={0} sx={{
      p: 2,
      borderRadius: 4,
      background: "linear-gradient(135deg, rgba(0,0,0,0.05), rgba(255,255,255,0.02))",
      border: "1px solid rgba(255,255,255,0.05)",
    }}>
      <Typography variant="subtitle2" color="text.secondary" mb={1}>
        HISTORY ON THIS TRACK
      </Typography>
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Year</TableCell>
              <TableCell>Race</TableCell>
              <TableCell align="center">Start</TableCell>
              <TableCell align="center">Finish</TableCell>
              <TableCell align="center">Avg Pos</TableCell>
              <TableCell align="center">Rating</TableCell>
              <TableCell align="center">Stage Pts</TableCell>
              <TableCell align="center">Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r, i) => (
              <TableRow key={i}>
                <TableCell>{r.year}</TableCell>
                <TableCell>{r.race}</TableCell>
                <TableCell align="center">{r.start}</TableCell>
                <TableCell align="center">{r.finish}</TableCell>
                <TableCell align="center">{r.avg}</TableCell>
                <TableCell align="center">{r.rating}</TableCell>
                <TableCell align="center">{r.stage_pts}</TableCell>
                <TableCell align="center">{r.status === "finished" ? "✔️" : "❌"}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default TrackHistoryTable;