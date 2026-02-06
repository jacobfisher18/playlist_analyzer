import {
  Avatar,
  Text,
  Button,
  Container,
  Loader,
  Space,
} from "@mantine/core";
import { SpotifyUser } from "../types/user";

function Header(props: {
  logout: () => void;
  user: SpotifyUser | null;
  isSyncing?: boolean;
}) {
  const { user, isSyncing } = props;

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
      <Container
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          margin: 0,
          float: "left",
        }}
      >
        {isSyncing && (
          <>
            <Loader size="sm" />
            <Space w="xs" />
            <Text size="sm" c="dimmed">
              Syncing
            </Text>
          </>
        )}
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
