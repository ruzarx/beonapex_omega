import { useState } from "react";
import { Tabs, Tab, Box } from "@mui/material";

const RaceSeriesMenu = ({ onNascarSubMenuChange }) => {
  const [selectedSeries, setSelectedSeries] = useState("NASCAR");
  const [selectedNascarTab, setSelectedNascarTab] = useState("Fantasy");

  // Handles switching between different racing series
  const handleSeriesChange = (event, newValue) => {
    setSelectedSeries(newValue);

    if (newValue === "NASCAR") {
      setSelectedNascarTab("Fantasy");
      onNascarSubMenuChange("Fantasy"); // Notify App.js
    } else {
      onNascarSubMenuChange(null); // No NASCAR sub-menu for other series
    }
  };

  // Handles switching between NASCAR sub-menu tabs
  const handleNascarTabChange = (event, newValue) => {
    setSelectedNascarTab(newValue);
    onNascarSubMenuChange(newValue); // Notify App.js
  };

  return (
    <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
      {/* Top-Level Menu for Series Selection */}
      <Box sx={{ position: "relative" }}>
        <Tabs value={selectedSeries} onChange={handleSeriesChange} centered>
          <Tab label="NASCAR" value="NASCAR" />
          <Tab label="Formula 1" value="Formula 1" />
          <Tab label="Supercars" value="Supercars" />
        </Tabs>
      </Box>

      {/* NASCAR Sub-Menu Tabs */}
      {selectedSeries === "NASCAR" && (
        <Box sx={{ mt: 1, borderBottom: 1, borderColor: "divider" }}>
          <Tabs value={selectedNascarTab} onChange={handleNascarTabChange} centered>
            <Tab label="Fantasy" value="Fantasy" />
            <Tab label="Statistics" value="Statistics" />
            <Tab label="Fun" value="Fun" />
          </Tabs>
        </Box>
      )}
    </Box>
  );
};

export default RaceSeriesMenu;
