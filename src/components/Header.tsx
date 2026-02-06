import {
  Avatar,
  Text,
  Button,
  Container,
  Space,
} from "@mantine/core";
import { SpotifyUser } from "../types/user";

function Header(props: { logout: () => void; user: SpotifyUser | null }) {
  const { user } = props;

  return (
    <Container
      py="lg"
      style={{
        display: "flex",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        paddingLeft: 0,
        paddingRight: 0,
      }}
    >
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
