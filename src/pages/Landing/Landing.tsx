import React, { useEffect } from "react";
import queryString from "query-string";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import { authWithSpotify } from "../../api/auth";
import { Button, Title, Container, Space, Text } from "@mantine/core";
import { COLORS } from "../../styles/colors";

export const Landing = (props: {
  location: any;
  cookies: any;
  history: any;
}): JSX.Element => {
  useEffect(() => {
    const access_token = queryString.parse(location.hash).access_token || "";

    if (access_token) {
      props.cookies.set("access_token", access_token);
      props.history.push("/home");
    } else if (props.cookies.get("access_token")) {
      props.history.push("/home");
    }
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        width: "100%",
        height: "100%",
        textAlign: "center",
        paddingTop: 120,
        margin: 0,
        backgroundImage: "linear-gradient(-116deg, #b873ac 5%, #8bb2e2 100%)",
      }}
    >
      <Container
        style={{
          backgroundColor: "white",
          width: 500,
          padding: 50,
          borderRadius: 5,
          boxShadow: "4px 4px 4px rgba(0,0,0,0.08)",
        }}
      >
        <Title order={3} color={COLORS.primary}>
          Spotify
        </Title>
        <Space h="xs" />
        <Title order={1} color="#555555">
          Playlist Search
        </Title>
        <Space h="lg" />
        <Text color="#555555">
          Search all your tracks across all your playlists at once
        </Text>
        <Space h="xl" />
        <Button
          onClick={() => authWithSpotify()}
          style={{
            backgroundColor: COLORS.primary,
            borderRadius: 100,
            borderWidth: 0,
          }}
        >
          Login with Spotify
        </Button>
      </Container>
    </div>
  );
};

Landing.propTypes = {
  cookies: instanceOf(Cookies).isRequired,
};

export default withCookies(Landing);
