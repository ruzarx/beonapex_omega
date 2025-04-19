export const getSeasonData = (dataType, season, raceNumber = 36) => {
  const fileName = dataType === "standings"
          ? `standings_${season}.json`
          : dataType === "race"
          ? `data_${season}.json`
          : (() => {
              throw new Error(`Unknown dataType: ${dataType}`);
            })();
  const seasonData = loadJsonData(fileName).filter((race) => race.race_number <= raceNumber);
  return seasonData;
};

export const getManySeasonData = (dataType, startYear) => {
  const results = [];
  const seasonRange = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].filter((y) => y >= startYear);

  for (const year of seasonRange) {
    let fileName;
    if (dataType === "standings") {
      fileName = `standings_${year}.json`;
    } else if (dataType === "race") {
      fileName = `data_${year}.json`;
    } else {
      throw new Error(`Unknown dataType: ${dataType}`);
    }

    try {
      results.push(...loadJsonData(fileName));
    } catch (e) {
      console.warn(`Skipping missing or failed file: ${fileName}`);
    }
  }

  return results;
};

    
export const getTrackData = (startYear, track, trackFilterType = 'exact') => {
  const results = [];
  const seasonRange = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].filter((y) => y >= startYear);
  const similarTracksMap = loadJsonData("track_similarity.json");
  for (const year of seasonRange) {
    const fileName = `data_${year}.json`;
    try {
      const seasonData = loadJsonData(fileName);
      let filtered = seasonData;
      filtered = filtered.filter((race) => {
        const isExact = race.track_name === track;
        const isSimilar = similarTracksMap[track]?.includes(race.track_name);

        if (trackFilterType === "exact") return isExact;
        if (trackFilterType === "similar") return isSimilar;
        if (trackFilterType === "both") return isExact || isSimilar;
        return false;
      });
      results.push(...filtered);
    } catch (e) {
      console.warn(`Skipping missing or failed file: ${fileName}`);
    }
  }
  return results;
}  


export const loadJsonData = (filename) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", `/data/${filename}`, false);
    xhr.send();
    
    if (xhr.status === 200) {
      return JSON.parse(xhr.responseText);
    } else {
      throw new Error(`Failed to load ${filename}: ${xhr.status}`);
    }
  };