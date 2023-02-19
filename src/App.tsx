import React from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { CookiesProvider } from "react-cookie";
import Home from "./pages/Home/Home";
import Landing from "./pages/Landing/Landing";
import { MantineProvider } from "@mantine/core";

const App = (): JSX.Element => {
  return (
    <CookiesProvider>
      <MantineProvider
        theme={{ colorScheme: "dark" }}
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
    </CookiesProvider>
  );
};

export default App;
