import { Box, Text, UnstyledButton, Loader, Avatar } from "@mantine/core";
import { COLORS } from "../styles/colors";
import { SpotifyUser } from "../types/user";

const SIDEBAR_WIDTH = 240;

const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const LogoutIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ flexShrink: 0 }}
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

interface SidebarProps {
  user: SpotifyUser | null;
  isSyncing?: boolean;
  onLogout: () => void;
  onLogoClick: () => void;
}

const Sidebar = ({
  user,
  isSyncing,
  onLogout,
  onLogoClick,
}: SidebarProps): JSX.Element => {
  return (
    <Box
      component="aside"
      style={{
        position: "sticky",
        top: 0,
        alignSelf: "flex-start",
        width: SIDEBAR_WIDTH,
        minWidth: SIDEBAR_WIDTH,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 12px",
        backgroundColor: COLORS.sidebarBg,
      }}
    >
      <Box
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          paddingLeft: 8,
          paddingRight: 4,
        }}
      >
        <UnstyledButton
          onClick={onLogoClick}
          style={{
            color: COLORS.primary,
            letterSpacing: "-0.02em",
          }}
        >
          <Text fw={700} size="xl">
            Sortify
          </Text>
        </UnstyledButton>
        {isSyncing && <Loader size="sm" color={COLORS.primary} />}
      </Box>

      <Box component="nav" style={{ flex: 1 }}>
        <UnstyledButton
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            width: "100%",
            padding: "10px 12px",
            borderRadius: 8,
            color: "var(--mantine-color-dark-1)",
          }}
          styles={{
            root: {
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.06)",
              },
            },
          }}
        >
          <SearchIcon />
          <Text size="sm" fw={500}>
            Search
          </Text>
        </UnstyledButton>
      </Box>

      <Box
        style={{
          paddingTop: 12,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {user && (
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "6px 12px",
              minWidth: 0,
            }}
          >
            <Avatar
              src={user.images?.[0]?.url}
              radius="xl"
              size={36}
              color="dark"
            />
            <Text
              size="sm"
              fw={500}
              c="dark.1"
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {user.display_name}
            </Text>
          </Box>
        )}
        <UnstyledButton
          onClick={onLogout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            width: "100%",
            padding: "8px 12px",
            borderRadius: 8,
            color: "var(--mantine-color-dark-3)",
          }}
          styles={{
            root: {
              "&:hover": {
                backgroundColor: "rgba(255,255,255,0.06)",
                color: "var(--mantine-color-dark-2)",
              },
            },
          }}
        >
          <LogoutIcon />
          <Text size="sm">Log out</Text>
        </UnstyledButton>
      </Box>
    </Box>
  );
};

export default Sidebar;
