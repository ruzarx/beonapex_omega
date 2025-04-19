export const getStandings = (data, driver, feature) => {
    const driverRace = data.find((race) => race.driver_name === driver);
    if (!driverRace || !(feature in driverRace)) return "-";
    return driverRace[feature];
  };
  
  
export const getBestFinish = (data, driver) => {
    const driverRaces = data.filter((race) => race.driver_name === driver);
    if (driverRaces.length === 0) return "-";
    return Math.min(...driverRaces.map((entry) => entry.best_position));
  };
  

export const getRoundWins = (data, driver, currentRace) => {
  const driverRace = data.find((race) => race.driver_name === driver);
  let winField = null;
  if (currentRace <= 26) winField = "season_wins";
  else if (currentRace <= 29) winField = "playoff_16_wins";
  else if (currentRace <= 32) winField = "playoff_12_wins";
  else if (currentRace <= 35) winField = "playoff_8_wins";
  if (!driverRace || !(winField in driverRace)) return "-";
  return driverRace[winField];
}
