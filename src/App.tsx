import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home/Home";
import Landing from "./pages/Landing/Landing";
import { MantineProvider } from "@mantine/core";
import { COLORS } from "./styles/colors";

const App = (): JSX.Element => {
  return (
    <MantineProvider
          theme={{
            colorScheme: "dark",
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
  );
};

export default App;
