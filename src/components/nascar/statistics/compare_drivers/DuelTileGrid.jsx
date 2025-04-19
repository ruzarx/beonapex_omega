import React from "react";
import { Box, Typography, Tooltip, Grid, Avatar, Stack } from "@mui/material";
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import { loadJsonData } from "../../utils/dataLoader";

const calendar = loadJsonData("calendar.json");

const getTileColor = (delta) => {
  if (delta > 0) return "rgba(25, 118, 210, 0.15)"; // Blue tint
  if (delta < 0) return "rgba(251, 140, 0, 0.15)"; // Orange tint
  return "rgba(158, 158, 158, 0.15)"; // Gray tint
};

const getShadowColor = (delta) => {
  if (delta > 0) return "#1976d2";
  if (delta < 0) return "#fb8c00";
  return "#9e9e9e";
};

const getRaceLabel = (raceNumber, seasonYear, sameSeason) => {
    if (!sameSeason) return `R${raceNumber}`;
    const race = calendar.find(r => r.race_number === raceNumber && r.season_year === seasonYear);
    return race?.short_name || `Race ${raceNumber}`;
  };
  

const getPlayoffBorderColor = (raceNumber, seasonYear) => {
  const race = calendar.find(r => r.race_number === raceNumber && r.season_year === seasonYear);
  if (!race) return "transparent";
  if (race.stage === "playoff_16") return "#42a5f5"; // Round of 16 - blue
  if (race.stage === "playoff_12") return "#ffb74d"; // Round of 12 - orange
  if (race.stage === "playoff_8") return "#ba68c8";  // Round of 8 - purple
  if (race.stage === "playoff_4") return "#f06292";  // Championship 4 - pink
  return "transparent";
};

const DuelTileGrid = ({ driverAData, driverBData, seasonA, seasonB }) => {
  const driverAName = driverAData[0]?.driver_name || "Driver A";
  const driverBName = driverBData[0]?.driver_name || "Driver B";

  const raceResults = driverAData.map((raceA, idx) => {
    const raceB = driverBData[idx];
    const pointsA = raceA.season_points ?? 0;
    const pointsB = raceB?.season_points ?? 0;
    const finishA = raceA.race_pos ?? "–";
    const finishB = raceB?.race_pos ?? "–";
    return {
      race_number: raceA.race_number,
      season_year: raceA.season_year,
      track_name: raceA.track_name,
      pointsA,
      pointsB,
      finishA,
      finishB,
      delta: pointsA - pointsB,
    };
  });

  const totalWinsA = raceResults.filter((r) => r.delta > 0).length;
  const totalWinsB = raceResults.filter((r) => r.delta < 0).length;
  const pointDiff = raceResults.reduce((acc, r) => acc + r.delta, 0);
  const totalPointsA = raceResults.reduce((acc, r) => acc + r.pointsA, 0);
  const totalPointsB = raceResults.reduce((acc, r) => acc + r.pointsB, 0);

  const leader = totalWinsA > totalWinsB ? "A" : totalWinsB > totalWinsA ? "B" : null;

  return (
    <Box>
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Each tile compares points and finish positions of drivers per race. Blue tiles = {driverAName}, Orange tiles = {driverBName}. Glow indicates playoff rounds.
      </Typography>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 1 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Avatar sx={{ bgcolor: "#1976d2", width: 28, height: 28 }}>{driverAName[0]}</Avatar>
          {leader === "A" && <EmojiEventsIcon fontSize="small" color="warning" />}
        </Stack>
        <Typography variant="h6" fontWeight="bold">
          {`${driverAName} leads ${totalWinsA}–${totalWinsB} (${pointDiff >= 0 ? "+" : ""}${pointDiff} pts)`}
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {leader === "B" && <EmojiEventsIcon fontSize="small" color="warning" />}
          <Avatar sx={{ bgcolor: "#fb8c00", width: 28, height: 28 }}>{driverBName[0]}</Avatar>
        </Stack>
      </Stack>
      <Typography variant="body2" sx={{ mb: 2 }}>
        Total Points – {driverAName}: {totalPointsA} | {driverBName}: {totalPointsB} | Diff: {pointDiff >= 0 ? "+" : ""}{pointDiff}
      </Typography>

      <Grid container spacing={1} columns={6}>
        {raceResults.map((race) => {
          const playoffColor = getPlayoffBorderColor(race.race_number, race.season_year);
          return (
            <Grid item xs={1} key={race.race_number}>
              <Tooltip
                title={`Race ${race.race_number}: ${race.track_name}\n${driverAName}: ${race.pointsA} pts, P${race.finishA}\n${driverBName}: ${race.pointsB} pts, P${race.finishB}\nDiff: ${race.delta >= 0 ? "+" : ""}${race.delta}`}
                arrow
              >
                <Box
                  sx={{
                    width: "100%",
                    height: 80,
                    backgroundColor: getTileColor(race.delta),
                    borderRadius: 2,
                    boxShadow: `0 4px 10px ${getShadowColor(race.delta)}40, 0 0 8px ${playoffColor}`,
                    backdropFilter: "blur(4px)",
                    border: `2px solid ${playoffColor}`,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: "bold",
                    color: getShadowColor(race.delta),
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    '&:hover': {
                      transform: "scale(1.05)",
                      boxShadow: `0 6px 14px ${getShadowColor(race.delta)}80`
                    },
                    px: 0.3,
                    py: 0.5,
                    textAlign: "center",
                    fontSize: 10,
                  }}
                >
                  <Typography variant="caption" fontWeight="bold">
                    {getRaceLabel(race.race_number, race.season_year, seasonA === seasonB)}
                  </Typography>
                  <Typography variant="caption">{driverAName}: {race.pointsA} pts (P{race.finishA})</Typography>
                  <Typography variant="caption">{driverBName}: {race.pointsB} pts (P{race.finishB})</Typography>
                  <Typography variant="caption" fontSize={9}>
                    Δ {race.delta > 0 ? "+" : ""}{race.delta} pts
                  </Typography>
                </Box>
              </Tooltip>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default DuelTileGrid;