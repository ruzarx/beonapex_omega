import React from "react";
import FantasyOverviewTable from "../FantasyOverviewTable";
import FantasyDriverTable from "../FantasyDriverTable";

export const renderSelectedFantasyTable = (selectedTable, tableProps) => {
  switch (selectedTable) {
    case "overview":
      return <FantasyOverviewTable {...tableProps} />;
    case "finish":
      return <FantasyDriverTable {...tableProps} feature="race_pos" name="Finish Position" />;
    case "start":
      return <FantasyDriverTable {...tableProps} feature="quali_pos" name="Qualification Position" />;
    case "points":
      return <FantasyDriverTable {...tableProps} feature="fantasy_points" name="Fantasy Points" />;
    case "rating":
      return <FantasyDriverTable {...tableProps} feature="driver_rating" name="Rating" />;
    default:
      return null;
  }
};
