import React, { useState, useEffect } from "react";
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, CircularProgress
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from "chart.js";
import { Line } from "react-chartjs-2";
import { getSeasonData } from "../../utils/dataLoaderAsync";
import annotationPlugin from "chartjs-plugin-annotation";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  annotationPlugin
);

const StandingsDriverDrawer = ({ driver, open, onClose, seasonYear, currentRace }) => {
  const [driverRaces, setDriverRaces] = useState([]);
  const [driverStandings, setDriverStandings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!driver || !open) return;

      try {
        setIsLoading(true);
        const [races, standings] = await Promise.all([
          getSeasonData("data", seasonYear, currentRace),
          getSeasonData("standings", seasonYear, currentRace)
        ]);

        setDriverRaces(races.filter(r => r.driver_name === driver));
        setDriverStandings(standings.filter(r => r.driver_name === driver));
      } catch (error) {
        console.error("Error loading driver data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [driver, open, seasonYear, currentRace]);

  if (!driver) return null;

  const raceLabels = driverRaces.map(r => `R${r.race_number}`);
  const finishPositions = driverRaces.map(r => r.race_pos);
  const avgPositions = driverRaces.map((_, i) =>
    (driverRaces.slice(0, i + 1).reduce((sum, r) => sum + r.race_pos, 0) / (i + 1)).toFixed(2)
  );

  const pointsDiff = driverStandings.map(r => {
    const parsed = parseInt(r.point_gap_to_bubble, 10);
    return !isNaN(parsed) ? parsed : null;
  });

  // Relegation logic
  const relegationIndex = driverStandings.findIndex(r => {
    const parsed = parseInt(r.point_gap_to_bubble, 10);
    return !isNaN(parsed) && parsed <= -1000;
  });

  const annotations = {
    cutoffLine: {
      type: "line",
      yMin: 0,
      yMax: 0,
      borderColor: "gray",
      borderWidth: 2,
      borderDash: [6, 6],
      label: {
        enabled: true,
        content: "Cutoff",
        position: "start",
        backgroundColor: "rgba(0,0,0,0.6)",
        color: "white",
        font: { weight: "bold" }
      }
    }
  };

  if (relegationIndex !== -1) {
    annotations.relegationArea = {
      type: "box",
      xMin: raceLabels[relegationIndex - 1],
      xMax: raceLabels[raceLabels.length - 1],
      backgroundColor: "rgba(200, 0, 0, 0.1)",
      borderWidth: 0,
    };
    annotations.relegationLine = {
      type: "line",
      xMin: raceLabels[relegationIndex],
      xMax: raceLabels[relegationIndex],
      borderColor: "red",
      borderWidth: 2,
      borderDash: [5, 5],
      label: {
        enabled: true,
        content: "Relegated",
        position: "top",
        backgroundColor: "red",
        color: "white",
        font: { weight: "bold" }
      }
    };
  }

  const positionChartData = {
    labels: raceLabels,
    datasets: [
      {
        label: "Finish Position",
        data: finishPositions,
        borderColor: "blue",
        backgroundColor: "blue",
        tension: 0.3,
        pointRadius: 3,
      },
      {
        label: "Avg Running Position",
        data: avgPositions,
        borderColor: "green",
        backgroundColor: "green",
        borderDash: [5, 5],
        tension: 0.3,
        pointRadius: 3,
      }
    ]
  };

  const positionChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        reverse: true,
        min: 1,
        title: { display: true, text: "Position" }
      }
    }
  };

  const pointsChartData = {
    labels: raceLabels,
    datasets: [
      {
        label: "Points to Cutoff",
        data: pointsDiff,
        borderColor: "red",
        fill: false,
      }
    ]
  };

  const pointsChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        title: { display: true, text: "Points to Cutoff" }
      }
    },
    plugins: {
      annotation: { annotations }
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box sx={{ width: "60vw", p: 3, maxWidth: "100%" }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5">{driver}</Typography>
          <IconButton onClick={onClose}><CloseIcon /></IconButton>
        </Box>

        <Divider sx={{ mb: 2 }} />

        <Typography variant="h6">Race Position Trend</Typography>
        <Box sx={{ height: 200, width: "100%", mb: 3 }}>
          <Line data={positionChartData} options={positionChartOptions} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">Points to Cutoff</Typography>
        <Box sx={{ height: 200, width: "100%", mb: 3 }}>
          <Line data={pointsChartData} options={pointsChartOptions} />
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6">Season Race Results</Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Race</TableCell>
                <TableCell>Track</TableCell>
                <TableCell>Finish</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>Rating</TableCell>
                <TableCell>Stage Points</TableCell>
                <TableCell>Total Points</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
                {[...driverRaces].reverse().map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.race_number}</TableCell>  
                  <TableCell>{r.track_name}</TableCell>
                  <TableCell>{r.race_pos}</TableCell>
                  <TableCell>{r.quali_pos}</TableCell>
                  <TableCell>{r.driver_rating}</TableCell>
                  <TableCell>{r.stage_1_pts + r.stage_2_pts + r.stage_3_pts}</TableCell>
                  <TableCell>{r.stage_1_pts + r.stage_2_pts + r.stage_3_pts + r.race_finish_points}</TableCell>
                  <TableCell>{r.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>
    </Drawer>
  );
};

export default StandingsDriverDrawer;