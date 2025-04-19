import { useMemo } from "react";

export const useDriverCarNumbers = (races) => {
  return useMemo(() => {
    const map = {};
    races.forEach((r) => {
      if (!map[r.driver_name]) {
        map[r.driver_name] = r.car_number;
      }
    });
    return map;
  }, [races]);
};
