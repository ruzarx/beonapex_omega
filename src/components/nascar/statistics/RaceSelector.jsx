import {
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  IconButton,
  Tooltip,
  Box,
  useTheme,
} from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import React from "react";

const getPlayoffBorderColor = (raceNumber) => {
  if (raceNumber >= 27 && raceNumber <= 29) return "#42a5f5"; // Round of 16 - blue
  if (raceNumber >= 30 && raceNumber <= 32) return "#ffb74d"; // Round of 12 - orange
  if (raceNumber >= 33 && raceNumber <= 35) return "#ba68c8"; // Round of 8 - purple
  if (raceNumber === 36) return "#f06292";                    // Championship 4 - pink
  return "transparent"; // Regular season
};

const RaceSelector = ({ races, currentRace, onSelect, open, onToggle }) => {
  const theme = useTheme();
  const today = new Date();

  return (
    <Drawer
      variant="permanent"
      open={open}
      PaperProps={{
        sx: {
          width: open ? 240 : 76,
          transition: "width 0.3s",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      <IconButton onClick={onToggle} sx={{ mx: "auto", mt: 1 }}>
        {open ? <ChevronLeft /> : <ChevronRight />}
      </IconButton>

      <Box
        sx={{
          flexGrow: 1,
          overflowY: "auto",
          mt: 1,
          px: 1,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { width: 0 },
          "&:hover::-webkit-scrollbar": { width: "6px" },
          "&:hover::-webkit-scrollbar-thumb": {
            backgroundColor: "#b0b0b0",
            borderRadius: "3px",
          },
          "&:hover::-webkit-scrollbar-track": { background: "transparent" },
        }}
      >
        <List disablePadding dense>
          {races.map((race) => {
            const isUpcoming = new Date(race.race_date) > today;
            const borderColor = getPlayoffBorderColor(race.race_number);

            return (
              <Tooltip
                key={race.race_number}
                title={race.race_name}
                placement="right"
                disableHoverListener={open}
              >
                <ListItemButton
                  selected={race.race_number === currentRace}
                  onClick={() => !isUpcoming && onSelect(race)}
                  disabled={isUpcoming}
                  sx={{
                    minHeight: 30,
                    py: 0,
                    my: 0.5,
                    borderLeft: `4px solid ${borderColor}`,
                    '&.Mui-selected': {
                      bgcolor: theme.palette.action.selected,
                    },
                    '&:hover': {
                      bgcolor: theme.palette.action.hover,
                    },
                  }}
                >
                  <ListItemText
                    primary={open ? race.race_name : race.short_name}
                    primaryTypographyProps={{
                      fontSize: "0.775rem",
                      fontStyle: isUpcoming ? "italic" : "normal",
                      fontWeight: !isUpcoming ? 500 : "normal",
                      color: isUpcoming
                        ? theme.palette.text.secondary
                        : theme.palette.text.primary,
                      lineHeight: 1.2,
                    }}
                  />
                </ListItemButton>
              </Tooltip>
            );
          })}
        </List>
      </Box>
    </Drawer>
  );
};

export default RaceSelector;
