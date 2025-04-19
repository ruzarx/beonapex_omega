import React, { useMemo } from "react";
import {
  Card,
  Typography,
  Box,
  Stack
} from "@mui/material";
import { motion } from "framer-motion";
import { format, differenceInCalendarDays } from "date-fns";

const NextRaceCountdown = ({ nextRaceData }) => {
  const { next_race_track, next_race_date } = nextRaceData;

  const daysLeft = useMemo(() => {
    const today = new Date();
    const raceDate = new Date(next_race_date);
    return Math.max(0, differenceInCalendarDays(raceDate, today));
  }, [next_race_date]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        elevation={0}
        sx={{
          backdropFilter: "blur(10px)",
          background: "linear-gradient(135deg, rgba(255,165,0,0.25), rgba(255,255,255,0.08))",
          borderRadius: 4,
          border: "1px solid rgba(255, 255, 255, 0.1)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          p: 3,
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            NEXT RACE
          </Typography>
          <Typography variant="h6" fontWeight="bold">
            {next_race_track}
          </Typography>
          <Typography variant="body1">
            🗓 {format(new Date(next_race_date), "MMMM d, yyyy")}
          </Typography>
          <Typography variant="h5" color="primary">
            {daysLeft} days to go
          </Typography>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default NextRaceCountdown;
