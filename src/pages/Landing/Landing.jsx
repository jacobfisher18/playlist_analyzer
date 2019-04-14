import React, { Component } from 'react';
import queryString from 'query-string';
import { authWithSpotify } from '../../utilities/auth';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import './Landing.css';

class Landing extends Component {

  static propTypes = {
    cookies: instanceOf(Cookies).isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      access_token: ''
    };
  }

  componentDidMount() {
    const access_token = queryString.parse(this.props.location.hash).access_token || '';

    if (access_token) {
      this.props.cookies.set('access_token', access_token);
      this.props.history.push("/home");
    } else if (this.props.cookies.get('access_token')) {
      this.props.history.push("/home");
    }
  }

  render() {
    return (
      <div className="Landing">
        <h3 className="Landing_Title_Spotify">Spotify</h3>
        <h1 className="Landing_Title_Playlist_Analyzer">PLAYLIST ANALYZER</h1>
        <h5 className="Landing_Title_Web_App">
          A web app by <span className="Landing_Title_Name">Jacob Fisher</span>
        </h5>
        <button className="Landing_Button_Login" onClick={() => authWithSpotify()}>
          LOGIN
        </button>
      </div>
    );
  }
}

export default withCookies(Landing);
