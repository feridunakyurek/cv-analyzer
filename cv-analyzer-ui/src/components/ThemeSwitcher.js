import React from "react";
import { IconButton, useTheme } from "@mui/material";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import { useColorMode } from "../context/ThemeContext";

const ThemeSwitcher = () => {
  const theme = useTheme();
  const { toggleColorMode } = useColorMode();
  const isDark = theme.palette.mode === "dark";

  return (
    <IconButton
      sx={{ ml: 1 }}
      onClick={toggleColorMode}
      color="inherit"
      aria-label="tema değiştir"
    >
      {isDark ? (
        <Brightness7Icon 
          key="sun" 
          className="theme-icon-anim" 
          sx={{ color: "orange" }} 
        />
      ) : (
        <Brightness4Icon 
          key="moon" 
          className="theme-icon-anim" 
          sx={{ color: "inherit" }} 
        />
      )}
    </IconButton>
  );
};

export default ThemeSwitcher;