// src/components/shared/GroupSelector.js
import React from "react";
import { Chip, Stack, Divider } from "@mui/material";
import { getGroupChips } from ".//fantasyGroups";

const GroupSelector = ({ useStarGroup, setUseStarGroup, selectedGroup, setSelectedGroup }) => {
  const groupChips = getGroupChips(useStarGroup);
  const isAllSelected = selectedGroup === "All";

  return (
    <Stack direction="row" spacing={2} justifyContent="center" flexWrap="wrap" sx={{ mb: 3 }}>
        {/* Star/Open Toggle as dual chips */}
        <Stack direction="row" spacing={1} alignItems="center">
            <Chip
            label="Star"
            color={useStarGroup ? "primary" : "default"}
            variant={useStarGroup ? "filled" : "outlined"}
            onClick={() => setUseStarGroup(true)}
            clickable
            />
            <Chip
            label="Open"
            color={!useStarGroup ? "primary" : "default"}
            variant={!useStarGroup ? "filled" : "outlined"}
            onClick={() => setUseStarGroup(false)}
            clickable
            />
        </Stack>

        {/* Divider */}
        <Divider orientation="vertical" flexItem sx={{ mx: 1, borderColor: "#ccc" }} />

        {/* Group Chips */}
        {groupChips.map((group) => (
            <Chip
            key={group}
            label={group}
            color={selectedGroup === group ? "secondary" : "default"}
            onClick={() => setSelectedGroup(group)}
            clickable
            />
        ))}

        {/* "All" Group */}
        <Chip
            label="All"
            color={isAllSelected ? "secondary" : "default"}
            variant={isAllSelected ? "filled" : "outlined"}
            onClick={() => setSelectedGroup("All")}
            clickable
            sx={{ ml: 1 }}
        />
        </Stack>

  );
};

export default GroupSelector;
