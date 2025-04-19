import { useState } from "react";

export const useFantasyDrawer = () => {
  const [selectedDriver, setSelectedDriver] = useState(null);

  const handleDriverClick = (driver) => setSelectedDriver(driver);
  const closeDrawer = () => setSelectedDriver(null);

  return {
    selectedDriver,
    handleDriverClick,
    closeDrawer,
  };
};
