import { useEffect, useState } from "react";
import { getManySeasonData, loadJsonData, getSeasonData, getTrackData } from "../../utils/dataLoader";


const entryList = loadJsonData("entry_list.json");
const nextRaceData = loadJsonData("next_race_data.json");
const nextRaceTrack = nextRaceData["next_race_track"];
const currentSeason = nextRaceData["next_race_number"] === 1
  ? nextRaceData["next_race_season"] - 1
  : nextRaceData["next_race_season"];
const currentRaceNumber = nextRaceData["next_race_number"] - 1;
const allowedDrivers = entryList[currentSeason.toString()] || [];

export const useFantasyRaceData = (selectedGroup, useStarGroup) => {
  const [state, setState] = useState({
    trackRaces: [],
    similarTrackRaces: [],
    allRaces: [],
    currentSeasonRaces: [],
    pastSeasonRaces: [],
    groupDrivers: [],
  });

  useEffect(() => {
    if (!selectedGroup) return;

    const groupType = useStarGroup ? "star_group" : "open_group";

    const currentTrackRaces = getTrackData(2022, nextRaceTrack, "exact")
      .sort((a, b) => new Date(b.race_date) - new Date(a.race_date));
    const similarTrackRaces = getTrackData(2022, nextRaceTrack, "both");
    const allRaces = getManySeasonData("race", 2022);
    const currentSeasonRaces = getSeasonData("race", currentSeason, currentRaceNumber);
    const pastSeasonRaces = getSeasonData("race", currentSeason - 1, currentRaceNumber);

    const driverPool = selectedGroup === "All"
      ? currentSeasonRaces
      : currentSeasonRaces.filter(r => r[groupType] === selectedGroup);

    const groupDrivers = [...new Set(
      driverPool.map(r => r.driver_name).filter(name => allowedDrivers.includes(name))
    )];

    setState({
      trackRaces: currentTrackRaces,
      similarTrackRaces,
      allRaces,
      currentSeasonRaces,
      pastSeasonRaces,
      groupDrivers,
    });
  }, [selectedGroup, useStarGroup]);

  return state;
};
