import React, { useState, useMemo } from "react";
import RaceSeriesMenu from "./components/RaceSeriesMenu";
import FantasyMainScreen from "./components/nascar/fantasy/FantasyMainScreen";
import StatisticsMainScreen from "./components/nascar/statistics/StatisticsMainScreen";
import FavoriteDriverDashboard from "./components/nascar/fun/driver_dashboard/FavoriteDriverDashboard";
import { createTheme, ThemeProvider, CssBaseline, Box, RadioGroup, FormControlLabel, Radio } from "@mui/material";

const App = () => {
  const [themeMode, setThemeMode] = useState("dark"); // Default to dark mode
  const [selectedNascarTab, setSelectedNascarTab] = useState("Fantasy"); // Default NASCAR sub-menu selection

  // Create theme dynamically based on state
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeMode,
          ...(themeMode === "dark"
            ? {
                background: { default: "#1E1E1E", paper: "#252525" },
                text: { primary: "#E0E0E0", secondary: "#B0B0B0" },
                primary: { main: "#90CAF9" },
                secondary: { main: "#F48FB1" },
                divider: "#444444",
              }
            : {
                background: { default: "#FFFFFF", paper: "#F5F5F5" },
                text: { primary: "#000000", secondary: "#444444" },
                primary: { main: "#1976D2" },
                secondary: { main: "#D81B60" },
                divider: "#CCCCCC",
              }),
        },
      }),
    [themeMode]
  );

  const handleChangeTheme = (event) => {
    setThemeMode(event.target.value);
  };

  const handleNascarSubMenuChange = (newTab) => {
    setSelectedNascarTab(newTab);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ position: "absolute", right: "40px", top: "35px" }}>
        <RadioGroup value={themeMode} row onChange={handleChangeTheme}>
          <FormControlLabel control={<Radio />} value="dark" label="Dark" />
          <FormControlLabel control={<Radio />} value="light" label="Light" />
        </RadioGroup>
      </Box>

      <Box sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "100vh", p: 1 }}>
        <div className="max-w-4xl mx-auto shadow-lg rounded-lg p-4" style={{ backgroundColor: theme.palette.background.paper }}>
          <RaceSeriesMenu onNascarSubMenuChange={handleNascarSubMenuChange} />
        </div>

        {/* Render NASCAR Sub-Menu Content */}
        <div className="max-w-4xl mx-auto mt-4">
          {selectedNascarTab === "Fantasy" && <FantasyMainScreen />}
          {selectedNascarTab === "Statistics" && <StatisticsMainScreen themeMode={themeMode}/>}
          {selectedNascarTab === "Fun" && <FavoriteDriverDashboard />}
        </div>
      </Box>
    </ThemeProvider>
  );
};

export default App;
