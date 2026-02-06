import { useEffect } from "react";
import queryString from "query-string";
import { useAccessToken } from "../../hooks/useAccessToken";
import { useNavigate } from "react-router-dom";
import { authWithSpotify, exchangeCodeForToken } from "../../api/auth";
import { Button, Title, Container, Space, Text } from "@mantine/core";
import { COLORS } from "../../styles/colors";

export const Landing = (): JSX.Element => {
  const [accessToken, setAccessToken] = useAccessToken();
  const navigate = useNavigate();

  useEffect(() => {
    const run = async () => {
      const query = queryString.parse(location.search);
      const code = typeof query.code === "string" ? query.code : "";

      if (code) {
        const access_token = await exchangeCodeForToken(code);
        if (access_token) {
          setAccessToken(access_token);
          navigate("/home", { replace: true });
        }
      } else if (accessToken) {
        navigate("/home");
      }
    };
    run();
  }, [navigate, setAccessToken, accessToken]);

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
        <Title order={1} color={COLORS.primary}>
          Sortify
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

export default Landing;
