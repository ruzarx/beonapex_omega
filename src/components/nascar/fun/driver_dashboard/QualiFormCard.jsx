import React, { useState } from "react";
import {
  Card, Typography, Stack, ToggleButton, ToggleButtonGroup, Box
} from "@mui/material";
import { motion } from "framer-motion";
import DriverFormChart from "./DriverFormChart"; // reuse but only show quali_pos
import DriverFormTable from "./DriverFormTable"; // pass quali_pos only

const QualiFormCard = () => {
  const [tableScope, setTableScope] = useState("recent");

  const dummyTable = [
    { track: "Phoenix", date: "Mar 2025", quali_pos: 5, isPlayoff: false },
    { track: "Martinsville", date: "Apr 2025", quali_pos: 8, isPlayoff: true },
    { track: "New Hampshire", date: "Feb 2025", quali_pos: 4, isPlayoff: false },
    { track: "Bristol", date: "Jan 2025", quali_pos: 10, isPlayoff: false },
    { track: "Darlington", date: "Dec 2024", quali_pos: 12, isPlayoff: false },
  ];

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, rgba(0,128,255,0.15), rgba(255,255,255,0.05))",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "0 4px 30px rgba(0,0,0,0.1)",
        }}
      >
        <Stack spacing={2}>
          <Typography variant="subtitle2" color="text.secondary">
            QUALIFICATION FORM
          </Typography>

          <DriverFormChart metric="quali_pos" seasonRaceData={[]} />

          <Box>
            <ToggleButtonGroup
              value={tableScope}
              exclusive
              onChange={(e, newScope) => {
                if (newScope !== null) setTableScope(newScope);
              }}
              size="small"
              color="primary"
              fullWidth
              sx={{ borderRadius: 2, background: "rgba(255,255,255,0.04)", px: 1 }}
            >
              <ToggleButton value="recent">Recent</ToggleButton>
              <ToggleButton value="same_track">This Track</ToggleButton>
              <ToggleButton value="track_type">Similar Tracks</ToggleButton>
            </ToggleButtonGroup>

            <Box mt={2}>
              <DriverFormTable summaryData={dummyTable} field="quali_pos" />
            </Box>
          </Box>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default QualiFormCard;
