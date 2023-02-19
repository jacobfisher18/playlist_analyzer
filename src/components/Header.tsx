import React from "react";
import { Avatar, Text, Button, Container, Space } from "@mantine/core";

function Header(props: {
  logout: Function;
  user: { images: Array<{ url: string }>; display_name: string };
}) {
  const { user } = props;

  return (
    <Container
      p="lg"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      {user && user.images ? (
        <Avatar src={user.images[0].url || ""} radius="xl" />
      ) : (
        <span />
      )}
      <Space w="md" />
      <Text>{user.display_name}</Text>
      <Space w="md" />
      <Button onClick={() => props.logout()}>Log Out</Button>
    </Container>
  );
}

export default Header;
