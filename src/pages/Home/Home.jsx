import React, { Component } from "react";
import { instanceOf } from "prop-types";
import { withCookies, Cookies } from "react-cookie";
import AllTracks from "../../components/AllTracks";
import Header from "../../components/Header";
import { getUserProfile } from "../../api/spotify";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      access_token: this.props.cookies.get("access_token") || "",
      user: {
        display_name: "",
        images: [
          {
            url: "",
          },
        ],
      },
    };
  }

  async componentDidMount() {
    if (!this.state.access_token) {
      this.props.history.push("/");
    } else {
      const user = await getUserProfile(this.state.access_token);
      if (user) {
        this.setState({ user });
      } else {
        await this.logout();
      }
    }
  }

  /**
   * 1. Removes the access token cookie
   * 2. Sets the access token in the state to ''
   * 3. Navigates to the homepage
   */
  async logout() {
    await this.props.cookies.remove("access_token");
    this.setState({ access_token: "" }, () => {
      this.props.history.push("/");
    });
  }

  render() {
    return (
      <>
        <Header user={this.state.user} logout={this.logout.bind(this)}></Header>
        <AllTracks access_token={this.state.access_token} />
      </>
    );
  }
}

Home.propTypes = {
  cookies: instanceOf(Cookies).isRequired,
};

export default withCookies(Home);
