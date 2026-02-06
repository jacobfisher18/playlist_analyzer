import { useEffect, useState } from "react";
import { useAccessToken } from "../../hooks/useAccessToken";
import { useNavigate } from "react-router-dom";
import AllTracks from "../../components/AllTracks";
import Header from "../../components/Header";
import { getUserProfile } from "../../api/spotify";
import { SpotifyUser } from "../../types/user";
import { supabase } from "../../api/supabase";
import { useTracks } from "../../hooks/useTracks";

const SPOTIFY_USER_ID_KEY = "spotify_user_id";

const Home = (): JSX.Element => {
  const [accessToken, , removeAccessToken] = useAccessToken();
  const navigate = useNavigate();
  const [user, setUser] = useState<SpotifyUser | null>(null);
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
    <>
      <Header user={user} logout={logout} isSyncing={isSyncing} />
      <AllTracks allTracks={allTracks} loading={loading} error={error} />
    </>
  );
};

export default Home;
