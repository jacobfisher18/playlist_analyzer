import { useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import { useNavigate } from "react-router-dom";
import AllTracks from "../../components/AllTracks";
import Header from "../../components/Header";
import { getUserProfile } from "../../api/spotify";
import { SpotifyUser } from "../../types/user";

const Home = (): JSX.Element => {
  const [cookies, , removeCookie] = useCookies(["access_token"]);
  const navigate = useNavigate();
  const [accessToken, setAccessToken] = useState(cookies.access_token || "");
  const [user, setUser] = useState<SpotifyUser | null>(null);

  const logout = async () => {
    removeCookie("access_token");
    setAccessToken("");
    navigate("/");
  };

  useEffect(() => {
    const init = async () => {
      if (!accessToken) {
        navigate("/");
      } else {
        const userProfile = await getUserProfile(accessToken);
        if (userProfile) {
          setUser(userProfile);
        } else {
          await logout();
        }
      }
    };

    init();
  }, []);

  return (
    <>
      <Header user={user} logout={logout} />
      <AllTracks accessToken={accessToken} />
    </>
  );
};

export default Home;
