import React, { useState, useMemo, useEffect } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody, TableContainer,
  Collapse, IconButton, Box, Typography, CircularProgress
} from "@mui/material";
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { loadJsonData } from "../../utils/dataLoaderAsync";

const applyZebraTint = (colorEven, colorOdd, index) =>
  index % 2 === 0 ? colorEven : colorOdd;

const playoffLabelMap = {
  playoff_16: 'Round 16',
  playoff_12: 'Round 12',
  playoff_8: 'Round 8',
  playoff_4: 'Final'
};

const ExpandedTrackStats = ({ races, isDark }) => {
  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };
  const headerStyle = {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.05rem",
    color: isDark ? "#dddddd" : "#333333",
    bgcolor: isDark ? "#111111" : "#f5f5f5",
    borderBottom: `2px solid ${isDark ? "#333" : "#ccc"}`,
    px: 1,
    py: 1
  };

  return (
    <Box sx={{ margin: 1 }}>
      <Typography variant="subtitle2" gutterBottom>
        Last 10 Races
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerStyle}>Date</TableCell>
            <TableCell sx={headerStyle}>Cautions</TableCell>
            <TableCell sx={headerStyle}>Green %</TableCell>
            <TableCell sx={headerStyle}>Avg Green Run</TableCell>
            <TableCell sx={headerStyle}>Leaders</TableCell>
            <TableCell sx={headerStyle}>Lead Laps</TableCell>
            <TableCell sx={headerStyle}>Most Led</TableCell>
            <TableCell sx={headerStyle}>Most Led %</TableCell>
            <TableCell sx={headerStyle}>Passes</TableCell>
            <TableCell sx={headerStyle}>Top-15 Passes</TableCell>
            <TableCell sx={headerStyle}>Laps</TableCell>
            <TableCell sx={headerStyle}>Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {races.map((r, index) => {
            const calendarRace = calendar.find(
              c => c.season_year === r.season_year && c.race_number === r.race_number
            );
            const monthLabel = calendarRace
              ? new Date(calendarRace.race_date).toLocaleString('en-US', { month: 'short' })
              : null;
            const playoffNote = calendarRace?.stage && calendarRace.stage !== 'season'
              ? playoffLabelMap[calendarRace.stage]
              : null;

            return (
              <TableRow key={index}
                sx={{
                  bgcolor: index % 2 === 0
                    ? (isDark ? "#1e1e1e" : "#fff")
                    : (isDark ? "#2a2a2a" : "#f9f9f9")
                }}
              >
                <TableCell sx={{ ...cellStyle, textAlign: 'left' }}>
                  <span>{monthLabel} {r.season_year}</span>
                  {playoffNote && (
                    <span style={{
                      marginLeft: 8,
                      fontSize: '0.75rem',
                      color: isDark ? '#ffa726' : '#d84315',
                      fontWeight: 500
                    }}>
                      – {playoffNote}
                    </span>
                  )}
                </TableCell>
                <TableCell sx={cellStyle}>{r.cautions_number}</TableCell>
                <TableCell sx={cellStyle}>{(r.green_flag_percent * 100).toFixed(1)}%</TableCell>
                <TableCell sx={cellStyle}>{r.average_green_flag_run_laps.toFixed(1)}</TableCell>
                <TableCell sx={cellStyle}>{r.number_of_leaders}</TableCell>
                <TableCell sx={cellStyle}>{r.average_leading_run_laps.toFixed(1)}</TableCell>
                <TableCell sx={cellStyle}>{r.most_laps_led}</TableCell>
                <TableCell sx={cellStyle}>{(r.most_laps_led_percent * 100).toFixed(1)}%</TableCell>
                <TableCell sx={cellStyle}>{r.green_flag_passes.toFixed(1)}</TableCell>
                <TableCell sx={cellStyle}>{r.quality_passes.toFixed(1)}</TableCell>
                <TableCell sx={cellStyle}>{r.total_laps}</TableCell>
                <TableCell sx={cellStyle}>{r.driver_rating.toFixed(1)}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

const TrackOverviewTable = ({ themeMode }) => {
  const [calendar, setCalendar] = useState(null);
  const [trackData, setTrackData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const isDark = themeMode["themeMode"] === "dark";
  const [expanded, setExpanded] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [calendarData, trackData] = await Promise.all([
          loadJsonData("calendar.json"),
          loadJsonData("track_data.json")
        ]);
        setCalendar(calendarData);
        setTrackData(trackData);
      } catch (error) {
        console.error("Error loading track data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const trackStats = useMemo(() => {
    if (!trackData) return [];

    const grouped = {};
    trackData.forEach(row => {
      const { track_name } = row;
      if (!grouped[track_name]) grouped[track_name] = [];
      grouped[track_name].push(row);
    });

    return Object.entries(grouped).map(([track, races]) => {
      const avg = (key) => races.reduce((a, b) => a + (b[key] || 0), 0) / races.length;

      return {
        track_name: track,
        race_count: races.length,
        stats: {
          cautions_number: avg("cautions_number").toFixed(1),
          green_flag_percent: (avg("green_flag_percent") * 100).toFixed(1) + "%",
          average_green_flag_run_laps: avg("average_green_flag_run_laps").toFixed(1),
          number_of_leaders: avg("number_of_leaders").toFixed(1),
          average_leading_run_laps: avg("average_leading_run_laps").toFixed(1),
          most_laps_led: avg("most_laps_led").toFixed(1),
          most_laps_led_percent: (avg("most_laps_led_percent") * 100).toFixed(1) + "%",
          green_flag_passes: avg("green_flag_passes").toFixed(1),
          quality_passes: avg("quality_passes").toFixed(1),
          total_laps: avg("total_laps").toFixed(1),
          driver_rating: avg("driver_rating").toFixed(1),
        },
        recent_races: races
          .sort((a, b) => b.season_year - a.season_year || b.race_number - a.race_number)
          .slice(0, 10),
      };
    }).sort((a, b) => a.track_name.localeCompare(b.track_name));
  }, [trackData]);

  if (isLoading || !calendar || !trackData) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  const cellStyle = { px: 1, py: 0.5, fontSize: "0.85rem", textAlign: "center" };
  const headerStyle = {
    textAlign: "center",
    fontWeight: "bold",
    fontSize: "0.9rem",
    textTransform: "uppercase",
    letterSpacing: "0.05rem",
    color: isDark ? "#dddddd" : "#333333",
    bgcolor: isDark ? "#111111" : "#f5f5f5",
    borderBottom: `2px solid ${isDark ? "#333" : "#ccc"}`,
    px: 1,
    py: 1
  };

  return (
    <TableContainer>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell sx={headerStyle} />
            <TableCell sx={headerStyle}>Track</TableCell>
            <TableCell sx={headerStyle}>Avg Cautions</TableCell>
            <TableCell sx={headerStyle}>Avg Green %</TableCell>
            <TableCell sx={headerStyle}>Avg Green Run</TableCell>
            <TableCell sx={headerStyle}>Avg Leaders</TableCell>
            <TableCell sx={headerStyle}>Avg Lead Run</TableCell>
            <TableCell sx={headerStyle}>Avg Most Led</TableCell>
            <TableCell sx={headerStyle}>Avg Most Led %</TableCell>
            <TableCell sx={headerStyle}>Avg Passes</TableCell>
            <TableCell sx={headerStyle}>Avg Top-15 Passes</TableCell>
            <TableCell sx={headerStyle}>Avg Laps</TableCell>
            <TableCell sx={headerStyle}>Avg Rating</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {trackStats.map((track, idx) => (
            <React.Fragment key={track.track_name}>
              <TableRow
                sx={{
                  bgcolor: applyZebraTint(
                    isDark ? "#1e1e1e" : "#fff",
                    isDark ? "#2a2a2a" : "#f9f9f9",
                    idx
                  ),
                  '& > *': { borderBottom: 'unset' },
                  cursor: 'pointer',
                }}
              >
                <TableCell>
                  <IconButton size="small" onClick={() => setExpanded(expanded === track.track_name ? null : track.track_name)}>
                    {expanded === track.track_name ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell sx={{ ...cellStyle, textAlign: "left" }}>{track.track_name}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.cautions_number}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.green_flag_percent}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.average_green_flag_run_laps}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.number_of_leaders}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.average_leading_run_laps}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.most_laps_led}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.most_laps_led_percent}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.green_flag_passes}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.quality_passes}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.total_laps}</TableCell>
                <TableCell sx={cellStyle}>{track.stats.driver_rating}</TableCell>
              </TableRow>
              <TableRow>
                <TableCell colSpan={14} sx={{ p: 0 }}>
                  <Collapse in={expanded === track.track_name} timeout="auto" unmountOnExit>
                    <ExpandedTrackStats races={track.recent_races} isDark={isDark} />
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TrackOverviewTable;
