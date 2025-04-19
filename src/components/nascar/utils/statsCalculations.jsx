import { loadJsonData } from "../utils/dataLoader";

const entryList = loadJsonData("entry_list.json");

export const getRacerTypeCol = (racerType) => {
    if (racerType === "driver") return "driver_name"
    else if (racerType === "team") return "team_name"
    else if (racerType === "manufacturer") return "manufacturer"
    else return "NO COLUMN"
}

export const getAvgValue = (data, entity, feature, racerType) => {
    const colName = getRacerTypeCol(racerType);
    const racerData = data.filter(race => race[colName] === entity);
    if (racerData.length === 0) return "-";
    const totalValue = racerData.reduce((sum, race) => sum + race[feature], 0);
    return (totalValue / racerData.length).toFixed(2);
  };
  
export const getSumValue = (data, entity, feature, racerType) => {
    const colName = getRacerTypeCol(racerType);
    const racerData = data.filter(race => race[colName] === entity);
    if (racerData.length === 0) return "-";
    return racerData.reduce((sum, race) => sum + race[feature], 0);
  };

export const compareSumToPrevSeason = (data, prevSeasonData, entity, feature, racerType) => {
    const colName = getRacerTypeCol(racerType);
    const racerData = data.filter(race => race[colName] === entity);
    const prevSeasonRacerData = prevSeasonData.filter(race => race[colName] === entity);
    if (racerData.length === 0 || prevSeasonRacerData.length === 0) return "-";
    const currentSeasonSum = racerData.reduce((sum, race) => sum + race[feature], 0);
    const prevSeasonSum = prevSeasonRacerData.reduce((sum, race) => sum + race[feature], 0);
    if (prevSeasonSum === 0) return "-";
    return (100 * (currentSeasonSum - prevSeasonSum) / prevSeasonSum).toFixed(2) + '%';
};

export const compareAvgToPrevSeason = (data, prevSeasonData, entity, feature, racerType) => {
    const colName = getRacerTypeCol(racerType);
    const racerData = data.filter(race => race[colName] === entity);
    const prevSeasonRacerData = prevSeasonData.filter(race => race[colName] === entity);
    if (racerData.length === 0 || prevSeasonRacerData.length === 0) return "-";
    const currentSeasonSum = racerData.reduce((sum, race) => sum + race[feature], 0) / racerData.length;
    const prevSeasonSum = prevSeasonRacerData.reduce((sum, race) => sum + race[feature], 0) / prevSeasonRacerData.length;
    if (prevSeasonSum === 0 ) return "-";
    return (100 * (currentSeasonSum - prevSeasonSum) / prevSeasonSum).toFixed(2) + '%';
};

export const compareAvgToAllDrivers = (data, entity, feature, racerType) => {
    const colName = getRacerTypeCol(racerType);
    const racerData = data.filter(race => race[colName] === entity);
    const otherRacersData = data.filter(race => race[colName] != entity);
    if (racerData.length === 0 || otherRacersData.length === 0) return "-";
    const racerAvgPasses = racerData.reduce((sum, race) => sum + race[feature], 0) / racerData.length;
    const othersAvgPasses = otherRacersData.reduce((sum, race) => sum + race[feature], 0) / otherRacersData.length;
    if (othersAvgPasses === 0 ) return "-";
    return (100 * (racerAvgPasses - othersAvgPasses) / othersAvgPasses).toFixed(2) + '%';
};

export const getPercentage = (data, entity, feature, value, racerType) => {
    const colName = getRacerTypeCol(racerType);
    const racerData = data.filter(race => race[colName] === entity);
    if (racerData.length === 0) return "-";
    const valueData = racerData.filter(race => race[feature] === value).length;
    return (100 * valueData / racerData.length).toFixed(2);
};


export const getStagePointsPercentage = (data, entity, racerType) => {
    const colName = getRacerTypeCol(racerType);
    const racerData = data.filter(race => race[colName] === entity);
    if (racerData.length === 0) return "-";
    const stagePoints = racerData.reduce((sum, race) => sum + race.race_stage_points, 0);
    const allPoints = racerData.reduce((sum, race) => sum + race.race_stage_points + race.race_finish_points, 0);
    return (100 * stagePoints / allPoints).toFixed(2);
};


export const getEntities = (raceData, entityType, seasonYear, sortColumn, isAsc) => {
    let entities;
    if (entityType === "driver") {
        if (seasonYear && entryList[seasonYear]) {
            entities = [...new Set(raceData.filter(r => (entryList[seasonYear].includes(r.driver_name))).map(r => r.driver_name))];
        } else {
            entities = [...new Set(raceData.map(r => r.driver_name))];
        }
    } else if (entityType === "team") {
        entities = [...new Set(raceData.map(r => r.team_name).filter(name => name.toLowerCase() !== "unknown"))];
    } else {
        entities = [...new Set(raceData.map(r => r.manufacturer))];
    }
    return entities.sort((a, b) => {
        const avgA = getAvgValue(raceData, a, sortColumn, entityType);
        const avgB = getAvgValue(raceData, b, sortColumn, entityType);
        return isAsc ? avgA - avgB : avgB - avgA;
    });
};