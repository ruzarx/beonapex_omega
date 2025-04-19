import React from "react";
import { Paper, Box, Typography, Divider } from "@mui/material";

const CompareDriverCard = ({ driverA, driverB, statsA, statsB, metricLabel }) => {
  return (
    <Paper elevation={3} sx={{ p: 2, mt: 2, borderRadius: 2 }}>
      <Typography variant="h6" gutterBottom>
        Head-to-Head: {driverA} vs {driverB}
      </Typography>

      <Divider sx={{ my: 1 }} />

      <Box sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
        {/* Driver A Block */}
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">{driverA}</Typography>
          <Typography variant="h6" color="primary">{statsA}</Typography>
        </Box>

        {/* Metric Label */}
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography variant="body2" color="text.secondary">{metricLabel}</Typography>
        </Box>

        {/* Driver B Block */}
        <Box sx={{ textAlign: "center", flex: 1 }}>
          <Typography variant="subtitle1" fontWeight="bold">{driverB}</Typography>
          <Typography variant="h6" color="primary">{statsB}</Typography>
        </Box>
      </Box>
    </Paper>
  );
};

export default CompareDriverCard;
