import React, { Component } from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import AllTracks from '../../components/AllTracks'
import Header from '../../components/Header.jsx';
import { spotifyGetRequest } from '../../utilities/apiRequests.js';
import './Home.css';

class Home extends Component {

  constructor(props) {
    super(props);

    this.state = {
      access_token: this.props.cookies.get('access_token') || '',
      user: {
        display_name: '',
        images: [
          {
            url: '',
          }
        ],
      },
    };
  }

  componentDidMount() {
    if (!this.state.access_token) {
      this.props.history.push("/")
    } else {
      this.getUserProfile();
    }
  }

  componentDidUpdate() {
    if (!this.state.access_token) {
      this.props.history.push("/")
    }
  }

  logout() {
    this.props.cookies.remove('access_token');
    this.setState({ access_token: '' });
  }

  getUserProfile() {
    const spotifyURL = 'https://api.spotify.com/v1/me';

    spotifyGetRequest(spotifyURL, this.state.access_token, (myJson) => {
      this.setState({ user: myJson });
    });
  }

  render() {
    return (
      <div className="Home">
        <Header user={this.state.user} logout={this.logout.bind(this)}></Header>
        <AllTracks
          access_token={this.state.access_token}
        />
      </div>
    );
  }
}

Home.propTypes = {
  cookies: instanceOf(Cookies).isRequired,
};

export default withCookies(Home);
