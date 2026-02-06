import { Box, Text, UnstyledButton, Loader, Avatar, Menu } from "@mantine/core";
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
    width="14"
    height="14"
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
        padding: "20px 12px 12px 12px",
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
          paddingTop: 18,
          paddingBottom: 12,
          paddingLeft: 16,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          alignItems: "center",
          gap: 10,
          minWidth: 0,
        }}
      >
        {user && (
          <>
            <Menu
              shadow="md"
              width={160}
              position="top-end"
              closeOnItemClick
              styles={{
                dropdown: {
                  paddingLeft: 14,
                  paddingRight: 10,
                  paddingTop: 6,
                  paddingBottom: 6,
                },
                item: {
                  fontSize: 13,
                  paddingTop: 6,
                  paddingBottom: 6,
                  minHeight: "unset",
                },
              }}
            >
              <Menu.Target>
                <UnstyledButton
                  style={{
                    borderRadius: "50%",
                    padding: 0,
                    lineHeight: 0,
                    background: "transparent",
                  }}
                  styles={{
                    root: {
                      border: "none",
                      outline: "none",
                      "&:hover": {
                        opacity: 0.85,
                        border: "none",
                        outline: "none",
                      },
                      "&:focus": { outline: "none", border: "none" },
                      "&:focus-visible": { outline: "none", border: "none" },
                    },
                  }}
                >
                  <Avatar
                    src={user.images?.[0]?.url}
                    radius="xl"
                    size={32}
                    color="dark"
                  />
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item icon={<LogoutIcon />} onClick={onLogout}>
                  Log out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
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
          </>
        )}
      </Box>
    </Box>
  );
};

export default Sidebar;
