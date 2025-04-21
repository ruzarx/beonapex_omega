export const getSeasonData = async (dataType, season, raceNumber = 36) => {
  console.log(`Getting season data for ${dataType}, season ${season}, race ${raceNumber}`);
  const fileName = dataType === "standings"
          ? `standings_${season}.json`
          : dataType === "race"
          ? `data_${season}.json`
          : (() => {
              throw new Error(`Unknown dataType: ${dataType}`);
            })();
  
  try {
    console.log(`Loading file: ${fileName}`);
    const seasonData = await loadJsonData(fileName);
    console.log(`Loaded ${seasonData?.length || 0} records from ${fileName}`);
    
    if (!seasonData || !Array.isArray(seasonData)) {
      console.warn(`Invalid data format from ${fileName}`);
      return [];
    }
    
    const filteredData = seasonData.filter((race) => race.race_number <= raceNumber);
    console.log(`Filtered to ${filteredData.length} records for race ${raceNumber}`);
    return filteredData;
  } catch (error) {
    console.warn(`Failed to load ${fileName}:`, error);
    return [];
  }
};

export const getManySeasonData = async (dataType, startYear) => {
  const seasonRange = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].filter((y) => y >= startYear);
  
  // Create an array of promises for each year's data
  const dataPromises = seasonRange.map(async (year) => {
    let fileName;
    if (dataType === "standings") {
      fileName = `standings_${year}.json`;
    } else if (dataType === "race") {
      fileName = `data_${year}.json`;
    } else {
      throw new Error(`Unknown dataType: ${dataType}`);
    }

    try {
      return await loadJsonData(fileName);
    } catch (e) {
      console.warn(`Skipping missing or failed file: ${fileName}`);
      return []; // Return empty array for failed loads
    }
  });

  // Wait for all promises to resolve
  const results = await Promise.all(dataPromises);
  
  // Flatten the array of arrays into a single array
  return results.flat();
};

export const getTrackData = async (startYear, track, trackFilterType = 'exact') => {
  const seasonRange = [2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016].filter((y) => y >= startYear);
  const similarTracksMap = await loadJsonData("track_similarity.json");
  
  // Create an array of promises for each year's data
  const dataPromises = seasonRange.map(async (year) => {
    const fileName = `data_${year}.json`;
    try {
      const seasonData = await loadJsonData(fileName);
      return seasonData.filter((race) => {
        const isExact = race.track_name === track;
        const isSimilar = similarTracksMap[track]?.includes(race.track_name);

        if (trackFilterType === "exact") return isExact;
        if (trackFilterType === "similar") return isSimilar;
        if (trackFilterType === "both") return isExact || isSimilar;
        return false;
      });
    } catch (e) {
      console.warn(`Skipping missing or failed file: ${fileName}`);
      return []; // Return empty array for failed loads
    }
  });

  // Wait for all promises to resolve
  const results = await Promise.all(dataPromises);
  
  // Flatten the array of arrays into a single array
  return results.flat();
};

export const loadJsonData = async (filename) => {
  console.log(`Attempting to load ${filename}...`);
  try {
    const response = await fetch(`/data/${filename}`);
    // console.log(`Response status for ${filename}:`, response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to load ${filename}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      });
      throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // console.log(`Successfully loaded ${filename}`);
    return data;
  } catch (error) {
    console.error(`Error loading JSON data from ${filename}:`, error);
    throw error;
  }
};