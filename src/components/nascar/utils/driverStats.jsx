// Calculate average of a field for given races
export const getAverage = (races, statField) => {
    const validValues = races.map(r => r[statField]).filter(v => v !== null && v !== undefined);
    if (validValues.length === 0) return "-";
  
    const total = validValues.reduce((sum, val) => sum + Number(val), 0);
    return (total / validValues.length).toFixed(2);
  };
  
  // Get stats row for a given stat field
  export const buildStatRow = (label, statField, currentRace, seasonRaces, allRaces, seasonRacesWithoutDriver) => {
    return {
      label,
      current: currentRace?.[statField] ?? "-",
      seasonAvg: getAverage(seasonRaces, statField),
      overallAvg: getAverage(allRaces, statField),
      seasonRacesWithoutDriverAvg: getAverage(seasonRacesWithoutDriver, statField),
    };
  };