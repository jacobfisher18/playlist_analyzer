import React, { useEffect, useState } from "react";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import AllTracks from "../../components/AllTracks";
import Header from "../../components/Header";
import { getUserProfile } from "../../api/spotify";

const Home = (props: { cookies: any; history: any }): JSX.Element => {
  const [accessToken, setAccessToken] = useState(
    props.cookies.get("access_token") || ""
  );
  const [user, setUser] = useState({
    display_name: "",
    images: [
      {
        url: "",
      },
    ],
  });

  useEffect(() => {
    const init = async () => {
      if (!accessToken) {
        props.history.push("/");
      } else {
        const user = await getUserProfile(accessToken);
        if (user) {
          setUser(user);
        } else {
          await logout();
        }
      }
    };

    init();
  }, []);

  /**
   * 1. Removes the access token cookie
   * 2. Sets the access token in the state to ''
   * 3. Navigates to the homepage
   */
  const logout = async () => {
    await props.cookies.remove("access_token");
    setAccessToken("");
    props.history.push("/");
  };

  return (
    <>
      <Header user={user} logout={logout.bind(this)}></Header>
      <AllTracks accessToken={accessToken} />
    </>
  );
};

Home.propTypes = {
  cookies: instanceOf(Cookies).isRequired,
};

export default withCookies(Home);
