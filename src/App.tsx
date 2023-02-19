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

const App = (): JSX.Element => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("light");
  const toggleColorScheme = (value?: ColorScheme) =>
    setColorScheme(value || (colorScheme === "dark" ? "light" : "dark"));

  return (
    <CookiesProvider>
      <ColorSchemeProvider
        colorScheme={colorScheme}
        toggleColorScheme={toggleColorScheme}
      >
        <MantineProvider
          theme={{ colorScheme }}
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
