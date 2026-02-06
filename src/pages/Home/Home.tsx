import { useEffect, useState } from "react";
import { Box } from "@mantine/core";
import { useLocation, useNavigate } from "react-router-dom";
import { COLORS } from "../../styles/colors";
import { useAccessToken } from "../../hooks/useAccessToken";
import AllTracks from "../../components/AllTracks";
import Sidebar from "../../components/Sidebar";
import PlayerBar from "../../components/PlayerBar";
import Player from "../Player/Player";
import { PlayerProvider } from "../../contexts/PlayerContext";
import { getUserProfile } from "../../api/spotify";
import { SpotifyUser } from "../../types/user";
import { supabase } from "../../api/supabase";
import { useTracks } from "../../hooks/useTracks";

const SPOTIFY_USER_ID_KEY = "spotify_user_id";

const Home = (): JSX.Element => {
  const [accessToken, , removeAccessToken] = useAccessToken();
  const navigate = useNavigate();
  const location = useLocation();
  const isPlayerView = location.pathname === "/home/player";
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [searchText, setSearchText] = useState("");
  const [spotifyUserId, setSpotifyUserId] = useState<string | null>(() =>
    typeof window !== "undefined"
      ? localStorage.getItem(SPOTIFY_USER_ID_KEY)
      : null,
  );
  const { allTracks, loading, error, isSyncing } = useTracks(
    accessToken ?? "",
    spotifyUserId,
    supabase,
  );

  const logout = async () => {
    localStorage.removeItem(SPOTIFY_USER_ID_KEY);
    removeAccessToken();
    navigate("/");
  };

  useEffect(() => {
    const init = async () => {
      if (!accessToken) {
        navigate("/");
        return;
      }
      const userProfile = await getUserProfile(accessToken);
      if (userProfile) {
        setUser(userProfile);
        setSpotifyUserId(userProfile.id);
        localStorage.setItem(SPOTIFY_USER_ID_KEY, userProfile.id);
      } else {
        await logout();
      }
    };
    init();
  }, [accessToken]);

  return (
    <Box style={{ display: "flex", width: "100%", minHeight: "100vh" }}>
      <Sidebar
        user={user}
        isSyncing={isSyncing}
        onLogout={logout}
        onLogoClick={() => {
          setSearchText("");
          navigate("/home");
        }}
      />
      <Box
        style={{
          flex: 1,
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          overflow: "hidden",
          backgroundColor: COLORS.mainBg,
        }}
      >
        <PlayerProvider accessToken={accessToken ?? undefined}>
          <Box
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
            }}
          >
            {isPlayerView ? (
              <Player />
            ) : (
              <AllTracks
                allTracks={allTracks}
                loading={loading}
                error={error}
                searchText={searchText}
                onSearchTextChange={setSearchText}
              />
            )}
          </Box>
          <PlayerBar />
        </PlayerProvider>
      </Box>
    </Box>
  );
};

export default Home;
