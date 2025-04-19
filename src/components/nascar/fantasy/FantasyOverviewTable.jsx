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
  Tooltip,
} from "@mui/material";
import FantasyDriverDetailsDrawer from "./FantasyDriverDetailsDrawer";
import { getAverageFeatureValue } from "../utils/raceUtils";
import { useSortedDrivers } from "../hooks/useSortedDrivers";
import { useDriverCarNumbers } from "../hooks/useDriverCarNumbers";
import { useFantasyDrawer } from "./hooks/useFantasyDrawer";
import { tableContainerSx } from "../styles/tableStyles";

const FantasyOverviewTable = ({ groupDrivers, trackRaces, pastSeasonRaces, currentSeasonRaces }) => {
  const [excludePlayoffs, setExcludePlayoffs] = React.useState(false);
  const [excludeDnf, setExcludeDnf] = React.useState(false);

  const { selectedDriver, handleDriverClick, closeDrawer } = useFantasyDrawer();
  const driverCarNumbers = useDriverCarNumbers(currentSeasonRaces);
  const sortedDrivers = useSortedDrivers(groupDrivers, trackRaces, "race_pos", excludePlayoffs, excludeDnf);

  return (
    <Paper sx={{ borderRadius: 3, p: 3, boxShadow: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <FormControlLabel
            control={<Checkbox checked={excludePlayoffs} onChange={() => setExcludePlayoffs(!excludePlayoffs)} />}
            label="Exclude Playoff Races"
          />
          <FormControlLabel
            control={<Checkbox checked={excludeDnf} onChange={() => setExcludeDnf(!excludeDnf)} />}
            label="Exclude DNFs"
          />
        </Box>
      </Box>

      <TableContainer sx={tableContainerSx}>
        <Table stickyHeader>
          <TableHead>
            <TableRow sx={{ bgcolor: "primary.main", position: "sticky", top: 0, zIndex: 2 }}>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>#</TableCell>
              <TableCell rowSpan={2} sx={{ fontWeight: "bold", px: 2 }}>Driver</TableCell>
              <Tooltip title={`Average finish position`}><TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Avg Finish Position</TableCell></Tooltip>
              <Tooltip title={`Average qualification position`}><TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Avg Start Position</TableCell></Tooltip>
              <Tooltip title={`Average race rating`}><TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Avg Fantasy Points</TableCell></Tooltip>
              <Tooltip title={`Average fantasy points earned`}><TableCell sx={{ fontWeight: "bold", textAlign: "center" }}>Avg Race Rating</TableCell></Tooltip>
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
                <Tooltip title={`Average finish position`}><TableCell sx={{ textAlign: "center" }}>{getAverageFeatureValue(trackRaces, driver, excludePlayoffs, excludeDnf, "race_pos")}</TableCell></Tooltip>
                <Tooltip title={`Average qualification position`}><TableCell sx={{ textAlign: "center" }}>{getAverageFeatureValue(trackRaces, driver, excludePlayoffs, excludeDnf, "quali_pos")}</TableCell></Tooltip>
                <Tooltip title={`Average race rating`}><TableCell sx={{ textAlign: "center" }}>{getAverageFeatureValue(trackRaces, driver, excludePlayoffs, excludeDnf, "fantasy_points")}</TableCell></Tooltip>
                <Tooltip title={`Average fantasy points earned`}><TableCell sx={{ textAlign: "center" }}>{getAverageFeatureValue(trackRaces, driver, excludePlayoffs, excludeDnf, "driver_rating")}</TableCell></Tooltip>
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

export default FantasyOverviewTable;
