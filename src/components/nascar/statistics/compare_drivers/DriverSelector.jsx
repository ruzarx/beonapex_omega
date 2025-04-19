import React from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";


const DriverSelector = ({
    allSeasons,
    allDriversA,
    allDriversB,
    driverA, setDriverA,
    driverB, setDriverB,
    seasonA, setSeasonA,
    seasonB, setSeasonB
  }) => {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: 3,
        mb: 4,
      }}
    >
      {/* DRIVER A */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Driver A
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Season</InputLabel>
          <Select
            value={seasonA}
            label="Season"
            onChange={(e) => setSeasonA(e.target.value)}
          >
            {allSeasons.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Driver</InputLabel>
          <Select value={driverA} onChange={(e) => setDriverA(e.target.value)} label="Driver">
            {allDriversA.map((d) => {
            const key = `${d.driver_name}_${d.car_number}`;
            return (
                <MenuItem key={key} value={key}>
                #{d.car_number} – {d.driver_name}
                </MenuItem>
            );
            })}
        </Select>
        </FormControl>
      </Box>

      {/* DRIVER B */}
      <Box>
        <Typography variant="subtitle1" gutterBottom>
          Driver B
        </Typography>

        <FormControl fullWidth>
          <InputLabel>Season</InputLabel>
          <Select
            value={seasonB}
            label="Season"
            onChange={(e) => setSeasonB(e.target.value)}
          >
            {allSeasons.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl fullWidth sx={{ mt: 2 }}>
          <InputLabel>Driver</InputLabel>
          <Select value={driverB} onChange={(e) => setDriverB(e.target.value)} label="Driver">
            {allDriversB.map((d) => {
            const key = `${d.driver_name}_${d.car_number}`;
            return (
                <MenuItem key={key} value={key}>
                #{d.car_number} – {d.driver_name}
                </MenuItem>
            );
            })}
        </Select>
        </FormControl>
      </Box>
    </Box>
  );
};

export default DriverSelector;
