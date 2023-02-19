import React, { useState } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import Home from "./pages/Home/Home";
import Landing from "./pages/Landing/Landing";
import {
  MantineProvider,
  ColorSchemeProvider,
  ColorScheme,
} from "@mantine/core";
import { COLORS } from "./styles/colors";

const App = (): JSX.Element => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <CookiesProvider>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{
            colorScheme,
            colors: {
              primary: [
                // Theme requires 10 shades of each color
                COLORS.primary,
                COLORS.primary,
                COLORS.primary,
                COLORS.primary,
                COLORS.primary,
                COLORS.primary,
                COLORS.primary,
                COLORS.primary,
                COLORS.primary,
                COLORS.primary,
              ],
            },
            primaryColor: "primary",
          }}
          withGlobalStyles
          withNormalizeCSS
        >
          <Router basename={process.env.PUBLIC_URL}>
            <div>
              <Route path="/" exact component={Landing} />
              <Route path="/home" component={Home} />
            </div>
          </Router>
        </MantineProvider>
      </ColorSchemeProvider>
    </CookiesProvider>
  );
};

export default App;
