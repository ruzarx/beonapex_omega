import React, { useMemo } from "react";
import { Box, Typography, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const DriverSelector = ({
    value,
    onChange,
    season,
    onSeasonChange,
    seasons,
    entryList
}) => {
    const drivers = useMemo(() => {
        if (!entryList || !Array.isArray(entryList)) return [];
        return entryList.map(driver => {
            // Handle both object and string formats
            if (typeof driver === 'string') {
                const [name, number] = driver.split('_');
                return {
                    driver_name: name,
                    car_number: number
                };
            }
            return {
                driver_name: driver.driver_name,
                car_number: driver.car_number
            };
        });
    }, [entryList]);

    return (
        <Box>
            <Typography variant="subtitle1" gutterBottom>
                Driver
            </Typography>

            <FormControl fullWidth>
                <InputLabel>Season</InputLabel>
                <Select
                    value={season}
                    label="Season"
                    onChange={(e) => onSeasonChange(e.target.value)}
                >
                    {seasons && seasons.map((s) => (
                        <MenuItem key={s} value={s}>
                            {s}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <FormControl fullWidth sx={{ mt: 2 }}>
                <InputLabel>Driver</InputLabel>
                <Select 
                    value={value} 
                    onChange={(e) => onChange(e.target.value)} 
                    label="Driver"
                >
                    {drivers.map((d) => {
                        const key = `${d.driver_name}_${d.car_number}`;
                        return (
                            <MenuItem key={key} value={key}>
                                #{d.car_number} – {d.driver_name}
                            </MenuItem>
                        );
                    })}
                </Select>
            </FormControl>
        </Box>
    );
};

export default DriverSelector;
