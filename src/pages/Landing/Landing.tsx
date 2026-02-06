import React, { useEffect, useState } from "react";
import queryString from "query-string";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import { authWithSpotify, exchangeCodeForToken } from "../../api/auth";
import { supabase, supabaseInitError } from "../../api/supabase";
import { Button, Title, Container, Space, Text } from "@mantine/core";
import { COLORS } from "../../styles/colors";

export type SupabaseStatus = "idle" | "connecting" | "connected" | "error";

export const Landing = (props: {
  location: any;
  cookies: any;
  history: any;
}): JSX.Element => {
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseStatus>("idle");
  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      const query = queryString.parse(location.search);
      const code = typeof query.code === "string" ? query.code : "";

      if (code) {
        const access_token = await exchangeCodeForToken(code);
        if (access_token) {
          props.cookies.set("access_token", access_token);
          props.history.replace("/home");
        }
      } else if (props.cookies.get("access_token")) {
        props.history.push("/home");
      }
    };
    run();
  }, []);

  useEffect(() => {
    if (!supabase) {
      setSupabaseStatus("error");
      setSupabaseError(supabaseInitError || "Supabase not available");
      return;
    }
    setSupabaseStatus("connecting");
    supabase
      .from("connection_test")
      .select("message")
      .limit(1)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setSupabaseStatus("error");
          setSupabaseError(error.message);
        } else {
          setSupabaseStatus("connected");
          setSupabaseError(null);
        }
      });
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
        <Space h="md" />
        <Text size="sm" color="#888">
          Supabase:{" "}
          {supabaseStatus === "idle" && "-"}
          {supabaseStatus === "connecting" && "connecting..."}
          {supabaseStatus === "connected" && "connected"}
          {supabaseStatus === "error" && "error: " + (supabaseError || "unknown")}
        </Text>
      </Container>
    </div>
  );
};

Landing.propTypes = {
  cookies: instanceOf(Cookies).isRequired,
};

export default withCookies(Landing);
