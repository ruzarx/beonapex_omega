import { useMemo } from "react";
import { getAverageFeatureValue } from "../utils/raceUtils";

export const useSortedDrivers = (groupDrivers, races, feature, excludePlayoffs, excludeDnf) => {
  return useMemo(() => {
    return [...groupDrivers].sort((a, b) => {
      const avgA = getAverageFeatureValue(races, a, excludePlayoffs, excludeDnf, feature);
      const avgB = getAverageFeatureValue(races, b, excludePlayoffs, excludeDnf, feature);

      const isInvalidA = avgA === "-" || isNaN(avgA);
      const isInvalidB = avgB === "-" || isNaN(avgB);

      if (isInvalidA && isInvalidB) return 0;
      if (isInvalidA) return 1;
      if (isInvalidB) return -1;

      return feature === "race_pos" || feature === "quali_pos"
        ? avgA - avgB
        : avgB - avgA;
    });
  }, [groupDrivers, races, feature, excludePlayoffs, excludeDnf]);
};
