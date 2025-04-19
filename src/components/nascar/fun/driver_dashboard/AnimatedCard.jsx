// src/components/common/AnimatedCard.jsx
import React from "react";
import { motion } from "framer-motion";

const AnimatedCard = ({ delay = 0, children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
