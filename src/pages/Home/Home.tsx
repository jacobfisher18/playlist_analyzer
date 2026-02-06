import { useEffect, useState } from "react";
import { useAccessToken } from "../../hooks/useAccessToken";
import { useNavigate } from "react-router-dom";
import AllTracks from "../../components/AllTracks";
import Header from "../../components/Header";
import { getUserProfile } from "../../api/spotify";
import { SpotifyUser } from "../../types/user";
import { supabase } from "../../api/supabase";

const Home = (): JSX.Element => {
  const [accessToken, , removeAccessToken] = useAccessToken();
  const navigate = useNavigate();
  const [user, setUser] = useState<SpotifyUser | null>(null);

  const logout = async () => {
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
      } else {
        await logout();
      }
    };
    init();
  }, [accessToken]);

  return (
    <>
      <Header user={user} logout={logout} />
      <AllTracks
        accessToken={accessToken ?? ""}
        spotifyUserId={user?.id ?? null}
        supabase={supabase}
      />
    </>
  );
};

export default Home;
