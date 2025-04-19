// 📌 Utility function to filter driver races based on playoffs
export const filterDriverRaces = (raceData, driver, raceDates, excludePlayoffs, excludeDnf) => {
  return raceData.filter(
    (entry) =>
      entry.driver_name === driver &&
      raceDates.includes(entry.race_date) &&
      (!excludePlayoffs || entry.season_stage === "season") &&
      (!excludeDnf || entry.status === 'finished')
  );
};

export const filterTeamRaces = (raceData, team, raceDates, excludePlayoffs, excludeDnf) => {
  return raceData.filter(
    (entry) =>
      entry.team_name === team &&
      (Array.isArray(raceDates) ? raceDates.includes(entry.race_date) : entry.race_date === raceDates) &&
      (!excludePlayoffs || entry.season_stage === "season") &&
      (!excludeDnf || entry.status === 'finished')
  );
};

// 📌 Utility function to calculate average finish position
export const getAverageFeatureValue = (raceData, driver, raceDates, excludePlayoffs, excludeDnf, feature) => {
  var totalFeatureValue;
  const driverRaces = filterDriverRaces(raceData, driver, raceDates, excludePlayoffs, excludeDnf);
  if (driverRaces.length === 0) return "-";
  if (feature === "fantasy_points") {
    totalFeatureValue = driverRaces.reduce((sum, race) => sum + race.finish_position_points + race.stage_points, 0);
  } else {
    totalFeatureValue = driverRaces.reduce((sum, race) => sum + race[feature], 0);
  }    
  return (totalFeatureValue / driverRaces.length).toFixed(2);
};

export const getCleanAverageFeatureValue = ( feature, races ) => {
  var totalFeatureValue;
  if (races.length === 0) return "-";
  if (feature === "fantasy_points") {
    totalFeatureValue = races.reduce((sum, race) => sum + race.finish_position_points + race.stage_points, 0);
  } else {
    totalFeatureValue = races.reduce((sum, race) => sum + race[feature], 0);
  }    
  return (totalFeatureValue / races.length).toFixed(2);
}

// 📌 Utility function to get a driver's finish position in a specific race
export const getFeatureValue = (raceData, driver, raceDate, excludePlayoffs, excludeDnf, feature) => {
  var feature_value;
  const raceEntry = raceData.find(
    (entry) =>
      entry.driver_name === driver &&
      entry.race_date === raceDate &&
      (!excludePlayoffs || entry.season_stage === "season") &&
      (!excludeDnf || entry.status === 'finished')
  );
  if (!raceEntry) return { value: "-", status: 'finished' };
  if (feature === "fantasy_points") {
    feature_value = (raceEntry?.finish_position_points ?? 0) + (raceEntry?.stage_points ?? 0);
  } else {
    feature_value = raceEntry?.[feature] ?? null;
  }    
  return { value: feature_value, status: raceEntry.status };
};

export const getTeamFeatureValue = (raceData, team, raceDate, excludePlayoffs, excludeDnf, feature) => {
  var totalFeatureValue;
  const teamRaces = filterTeamRaces(raceData, team, raceDate, excludePlayoffs, excludeDnf);
  if (teamRaces.length === 0) return "-";
  if (feature === "fantasy_points") {
    totalFeatureValue = teamRaces.reduce((sum, race) => sum + race.finish_position_points + race.stage_points, 0);
  } else {
    totalFeatureValue = teamRaces.reduce((sum, race) => sum + race[feature], 0);
  }    
  return (totalFeatureValue / teamRaces.length).toFixed(2);
};

// export const getTeamFantasyPoints = (raceData, team, raceDate, excludePlayoffs, excludeDnf, feature) => {
//   const teamRaces = filterTeamRaces(raceData, team, raceDate, excludePlayoffs, excludeDnf);
//   if (teamRaces.length === 0) return "-";
//   const totalFeatureValue = teamRaces.reduce((sum, race) => sum + race.finish_position_points + race.stage_points, 0);
//   return (totalFeatureValue / teamRaces.length).toFixed(2);
// };

// export const getFantasyPoints = (raceData, driver, raceDate, excludePlayoffs, excludeDnf) => {
//   const raceEntry = raceData.find(
//     (entry) =>
//       entry.driver_name === driver &&
//       entry.race_date === raceDate &&
//       (!excludePlayoffs || entry.season_stage === "season") &&
//       (!excludeDnf || entry.status === 'finished')
//   );
//   if (!raceEntry) return { value: "-", status: 'finished' };
//   return { value: raceEntry.finish_position_points + raceEntry.stage_points, status: raceEntry.status };
// };

// export const getAverageFantasyPoints = (raceData, driver, raceDates, excludePlayoffs, excludeDnf) => {
//   const driverRaces = filterDriverRaces(raceData, driver, raceDates, excludePlayoffs, excludeDnf);
//   if (driverRaces.length === 0) return "-";
//   const totalFantasyPoints = driverRaces.reduce((sum, race) => sum + race.finish_position_points + race.stage_points, 0);
//   return (totalFantasyPoints / driverRaces.length).toFixed(2);
// };

// 📌 Utility function to format dates as "Spring/Fall YEAR"
export const getSeasonLabel = (dateString) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  if (month < 6) return `Spring ${year}`;
  if (month < 9) return `Summer ${year}`;
  return `Fall ${year}`;
};

export const getRankInGroup = (feature, driver, driverAverages) => {
  driverAverages.sort((a, b) => {
    const valA = a[feature];
    const valB = b[feature];
    const isInvalidA = valA === "-" || isNaN(valA);
    const isInvalidB = valB === "-" || isNaN(valB);
    if (isInvalidA && isInvalidB) return 0; // Keep order if both are "-"
    if (isInvalidA) return 1; // Move A to the end
    if (isInvalidB) return -1; // Move B to the end
    if (feature === "race_pos" || feature === "quali_pos") {
      return valA - valB;
    } else {
      return valB - valA;
    }
  });
  const rank = driverAverages.findIndex(d => d.driver === driver) + 1;
  return rank || driverAverages.length + 1;
};


export const getPreviousRaceResult = (raceData, driver, feature, raceDates, n_past_race) => {
const currentDate = raceDates[raceDates.length - n_past_race]
const value = raceData.filter(
  (entry) =>
    entry.driver_name === driver &&
    entry.race_date === currentDate
  )
if (value.length === 0) {
  return "-"
}
else if (feature === "fantasy_points") {
  return value[0].finish_position_points + value[0].stage_points
} else {
  return value[0][feature]
}
};