import { useEffect, useState } from "react";
import { loadJsonData, getManySeasonData, getSeasonData, getTrackData } from "../../utils/dataLoaderAsync";

export const useFantasyRaceData = (selectedGroup, useStarGroup) => {
  const [trackRaces, setTrackRaces] = useState([]);
  const [similarTrackRaces, setSimilarTrackRaces] = useState([]);
  const [allRaces, setAllRaces] = useState([]);
  const [currentSeasonRaces, setCurrentSeasonRaces] = useState([]);
  const [pastSeasonRaces, setPastSeasonRaces] = useState([]);
  const [groupDrivers, setGroupDrivers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!selectedGroup) return;

    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Load initial async data
        const [entryList, nextRaceData] = await Promise.all([
          loadJsonData("entry_list.json"),
          loadJsonData("next_race_data.json")
        ]);

        const nextRaceTrack = nextRaceData["next_race_track"];
        const currentSeason = nextRaceData["next_race_number"] === 1
          ? nextRaceData["next_race_season"] - 1
          : nextRaceData["next_race_season"];
        const currentRaceNumber = nextRaceData["next_race_number"] - 1;
        const allowedDrivers = entryList[currentSeason.toString()] || [];

        const groupType = useStarGroup ? "star_group" : "open_group";

        // Process data in PARALLEL using async functions
        const [
          _TrackRaces,
          _similarTrackRaces,
          _allRaces,
          _currentSeasonRaces,
          _pastSeasonRaces
        ] = await Promise.all([
          getTrackData(2022, nextRaceTrack, "exact").then(races => 
            races.sort((a, b) => new Date(b.race_date) - new Date(a.race_date))
          ),
          getTrackData(2022, nextRaceTrack, "both"),
          getManySeasonData("race", 2022),
          getSeasonData("race", currentSeason, currentRaceNumber),
          getSeasonData("race", currentSeason - 1, currentRaceNumber)
        ]);

        const driverPool = selectedGroup === "All"
          ? _currentSeasonRaces
          : _currentSeasonRaces.filter(r => r[groupType] === selectedGroup);

        const _groupDrivers = [...new Set(
          driverPool.map(r => r.driver_name).filter(name => allowedDrivers.includes(name))
        )];

        // Update all states in a single batch
        setTrackRaces(_TrackRaces);
        setSimilarTrackRaces(_similarTrackRaces);
        setAllRaces(_allRaces);
        setCurrentSeasonRaces(_currentSeasonRaces);
        setPastSeasonRaces(_pastSeasonRaces);
        setGroupDrivers(_groupDrivers);
      } catch (error) {
        console.error("Error loading fantasy race data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [selectedGroup, useStarGroup]);

  return {
    trackRaces,
    similarTrackRaces,
    allRaces,
    currentSeasonRaces,
    pastSeasonRaces,
    groupDrivers,
    isLoading
  };
};
