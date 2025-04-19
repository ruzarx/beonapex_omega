import React from "react";
import { Card, Typography, Stack, Box } from "@mui/material";
import { motion } from "framer-motion";

const DriverProspectsText = () => {
  const dummyText = `
    Ross Chastain continues to show solid pace with an average finish just outside the top 10.
    His performance at short tracks this season has been competitive, with consistent running inside the top 15.
    Bristol has historically suited his aggressive style, and with momentum building, a top-10 finish is within reach.
  `;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <Card
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          background: "linear-gradient(135deg, rgba(255,255,255,0.03), rgba(128,0,255,0.08))",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <Stack spacing={1}>
          <Typography variant="subtitle2" color="text.secondary">
            🧠 Driver Insight
          </Typography>
          <Typography variant="body2" color="text.primary" sx={{ whiteSpace: "pre-line" }}>
            {dummyText.trim()}
          </Typography>
        </Stack>
      </Card>
    </motion.div>
  );
};

export default DriverProspectsText;
