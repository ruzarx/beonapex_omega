import React from "react";
import {
  TableContainer,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Checkbox,
  FormControlLabel,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import FantasyDriverDetailsDrawer from "./FantasyDriverDetailsDrawer";
import { getAverageFeatureValue, getFeatureValue, getSeasonLabel } from "../utils/raceUtils";
import { useDriverCarNumbers } from "../hooks/useDriverCarNumbers";
import { useFantasyDrawer } from "./hooks/useFantasyDrawer";
import { useSortedDrivers } from "../hooks/useSortedDrivers";
import { tableContainerSx } from "../styles/tableStyles";

const FantasyDriverTable = ({
  groupDrivers,
  trackRaces,
  similarTrackRaces,
  allRaces,
  currentSeasonRaces,
  pastSeasonRaces,
  feature,
  name,
}) => {
  const [excludePlayoffs, setExcludePlayoffs] = React.useState(false);
  const [excludeDnf, setExcludeDnf] = React.useState(false);

  const { selectedDriver, handleDriverClick, closeDrawer } = useFantasyDrawer();
  const driverCarNumbers = useDriverCarNumbers(currentSeasonRaces);
  const sortedDrivers = useSortedDrivers(groupDrivers, trackRaces, feature, excludePlayoffs, excludeDnf);
  const trackRaceDates = [...new Set(trackRaces.map(race => race.race_date))].sort((a, b) => new Date(b) - new Date(a));

  return (
    <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={excludePlayoffs} onChange={() => setExcludePlayoffs(!excludePlayoffs)} />}
            label="Exclude Playoff Races"
          />
          {feature !== "quali_pos" && (
            <FormControlLabel
              control={<Checkbox checked={excludeDnf} onChange={() => setExcludeDnf(!excludeDnf)} />}
              label="Exclude DNFs"
            />
          )}
        </Box>
        <Box sx={{ display: "flex", alignItems: "center" }}>
          <Box
            sx={{
              width: 20,
              height: 20,
              backgroundColor: "rgba(255, 0, 0, 0.2)",
              border: "1px solid red",
              borderRadius: 1,
              mr: 1,
            }}
          />
          <Typography variant="body2">Did Not Finish (DNF)</Typography>
        </Box>
      </Box>

      <TableContainer sx={tableContainerSx}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main", position: "sticky", top: 0, zIndex: 2 }}>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>#</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>Driver</TableCell>
              <TableCell colSpan={4} sx={{ fontWeight: "bold", textAlign: "center" }}>Average {name}</TableCell>
              {trackRaceDates.map((race_date, index) => (
                <TableCell key={index} rowSpan={2} sx={{ fontWeight: "bold", textAlign: "center" }}>{getSeasonLabel(race_date)}</TableCell>
              ))}
            </TableRow>
            <TableRow sx={{ bgcolor: "primary.light", position: "sticky", top: 53, zIndex: 1 }}>
              <Tooltip title={`Average ${name.toLowerCase()} on this track`}><TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>This Track</TableCell></Tooltip>
              <Tooltip title={`Average ${name.toLowerCase()} on similar tracks`}><TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Similar Tracks</TableCell></Tooltip>
              <Tooltip title={`Average ${name.toLowerCase()} on all tracks`}><TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>All Tracks</TableCell></Tooltip>
              <Tooltip title={`Average ${name.toLowerCase()} in the current season`}><TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>This Season</TableCell></Tooltip>
            </TableRow>
          </TableHead>

          <TableBody>
            {sortedDrivers.map((driver, index) => (
              <TableRow
                key={index}
                sx={{
                  bgcolor: index % 2 === 0 ? "background.default" : "action.hover",
                  "&:hover": { bgcolor: "action.selected", transition: "all 0.3s ease" },
                }}
              >
                <TableCell sx={{ width: "40px", fontWeight: "bold", px: 2, cursor: "pointer" }}>{driverCarNumbers[driver] || "-"}</TableCell>
                <TableCell sx={{ fontWeight: "bold", px: 2, cursor: "pointer" }} onClick={() => handleDriverClick(driver)}>{driver}</TableCell>
                <Tooltip title={`Average ${name.toLowerCase()} on this track`}><TableCell sx={{ textAlign: "center" }}>{getAverageFeatureValue(trackRaces, driver, excludePlayoffs, excludeDnf, feature)}</TableCell></Tooltip>
                <Tooltip title={`Average ${name.toLowerCase()} on similar tracks`}><TableCell sx={{ textAlign: "center" }}>{getAverageFeatureValue(similarTrackRaces, driver, excludePlayoffs, excludeDnf, feature)}</TableCell></Tooltip>
                <Tooltip title={`Average ${name.toLowerCase()} on all tracks`}><TableCell sx={{ textAlign: "center" }}>{getAverageFeatureValue(allRaces, driver, excludePlayoffs, excludeDnf, feature)}</TableCell></Tooltip>
                <Tooltip title={`Average ${name.toLowerCase()} in the current season`}><TableCell sx={{ textAlign: "center" }}>{getAverageFeatureValue(currentSeasonRaces, driver, excludePlayoffs, excludeDnf, feature)}</TableCell></Tooltip>
                {trackRaceDates.map((race_date, idx) => {
                  const currentRace = trackRaces.filter(race => race.race_date === race_date);
                  const { value, status } = getFeatureValue(currentRace, driver, excludePlayoffs, excludeDnf, feature);
                  return (
                    <Tooltip title={`${name} in this race`} key={idx}>
                      <TableCell
                        sx={{
                          textAlign: "center",
                          bgcolor: status !== "finished" ? "rgba(255, 0, 0, 0.2)" : "inherit",
                          fontWeight: status !== "finished" ? "bold" : "normal",
                        }}
                      >
                        {value}
                      </TableCell>
                    </Tooltip>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {selectedDriver && (
        <FantasyDriverDetailsDrawer
          driver={selectedDriver}
          groupDrivers={groupDrivers}
          trackRaces={trackRaces}
          pastSeasonRaces={pastSeasonRaces}
          currentSeasonRaces={currentSeasonRaces}
          onClose={closeDrawer}
        />
      )}
    </Paper>
  );
};

export default FantasyDriverTable;
