import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
  Stack,
  useTheme
} from "@mui/material";
import { motion } from "framer-motion";

const DriverHeaderCard = ({ driver }) => {
  const theme = useTheme();

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
          background: "linear-gradient(135deg, rgba(128,0,255,0.2), rgba(255,255,255,0.05))",
          borderRadius: 4,
          border: "1px solid rgba(255, 255, 255, 0.15)",
          boxShadow: "0 4px 30px rgba(0, 0, 0, 0.1)",
          p: 2,
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={driver.imageUrl}
            alt={driver.driver_name}
            sx={{
              width: 80,
              height: 80,
              boxShadow: `0 0 12px ${theme.palette.primary.main}`,
              border: `2px solid ${theme.palette.primary.light}`
            }}
          />
          <Box>
            <Typography variant="h6" fontWeight="bold">
              #{driver.car_number} — {driver.driver_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {driver.team_name}
            </Typography>
            <Typography variant="body1" mt={1}>
              🏁 <strong>{driver.championship_pos}</strong> in championship
            </Typography>
            <Typography variant="body2">
              {driver.total_points} points • {driver.total_wins} wins
            </Typography>
          </Box>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default DriverHeaderCard;
