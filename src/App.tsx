import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
          <Router basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/home" element={<Home />} />
            </Routes>
          </Router>
        </MantineProvider>
      </ColorSchemeProvider>
    </CookiesProvider>
  );
};

export default App;
