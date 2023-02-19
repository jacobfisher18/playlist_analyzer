import React from "react";
import {
  Avatar,
  Text,
  Button,
  Container,
  Space,
  useMantineColorScheme,
  Switch,
} from "@mantine/core";
import { SpotifyUser } from "../types/user";

function Header(props: { logout: Function; user: SpotifyUser | null }) {
  const { user } = props;

  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  return (
    <Container
      py="lg"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
      <Container style={{ margin: 0 }}>
        <Switch
          size="md"
          checked={dark}
          onChange={() => toggleColorScheme()}
          onLabel="LIGHT"
          offLabel="DARK"
        />
      </Container>
      <Container
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          margin: 0,
        }}
      >
        {user && user.images ? (
          <Avatar src={user.images[0].url || ""} radius="xl" />
        ) : (
          <span />
        )}
        <Space w="md" />
        <Text>{user ? user.display_name : ""}</Text>
        <Space w="md" />
        <Button onClick={() => props.logout()}>Log Out</Button>
      </Container>
    </Container>
  );
}

export default Header;
