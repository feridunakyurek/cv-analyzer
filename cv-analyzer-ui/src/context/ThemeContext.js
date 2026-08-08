import React, { createContext, useState, useMemo, useContext, useEffect } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const ColorModeContext = createContext({ toggleColorMode: () => {} });

export const useColorMode = () => useContext(ColorModeContext);

export const ColorModeProvider = ({ children }) => {
  const [mode, setMode] = useState("dark");

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
      },
      mode,
    }),
    [mode]
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          ...(mode === "light"
            ? {
                background: { default: "#f0f2f5", paper: "#ffffff" },
                text: { primary: "#1a2027", secondary: "#5e6c79" },
              }
            : {
                primary: { main: "#90caf9" },
                background: { default: "#071024", paper: "#1e293b" },
                text: { primary: "#ffffff", secondary: "rgba(255, 255, 255, 0.7)" },
              }),
        },
        typography: {
          fontFamily: "'Roboto', sans-serif",
        },
      }),
    [mode]
  );

  useEffect(() => {
    const root = document.documentElement;
    if (mode === "dark") {
      root.setAttribute("data-theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
    }
  }, [mode]);

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};