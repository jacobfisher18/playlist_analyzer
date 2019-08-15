import React, { Component } from 'react';
import { instanceOf } from 'prop-types';
import { withCookies, Cookies } from 'react-cookie';
import Sidebar from '../../components/Sidebar.jsx';
import AllTracks from '../../components/AllTracks'
import Header from '../../components/Header.jsx';
import PlaylistHeader from '../../components/PlaylistHeader.jsx';
import TrackList from '../../components/TrackList.jsx';
import Overview from '../../components/Overview.jsx';
import Stats from '../../components/Stats.jsx';
import PlaylistMenu from '../../components/PlaylistMenu.jsx';
import { spotifyGetRequest } from '../../utilities/apiRequests.js';
import { playlist_menu_tabs } from '../../utilities/constants.js';
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
      playlists: [],
      currentPlaylist: {
        name: '',
        tracks: {
          total: 0,
        },
        images: [
          {
            url: '',
          }
        ]
      },
      currentPlaylistTracks: [],
      currentPlaylistTrackStats: [],
      activeTab: playlist_menu_tabs[0],
      activePage: 'ALL_TRACKS',
    };
  }

  componentDidMount() {
    if (!this.state.access_token) {
      this.props.history.push("/")
    } else {
      this.getPlaylists();
      this.getUserProfile();
    }
  }

  componentDidUpdate() {
    if (!this.state.access_token) {
      this.props.history.push("/")
    }
  }

  logout() {
    // this.props.cookies.set('access_token', '');
    this.props.cookies.remove('access_token');
    this.setState({ access_token: '' });
  }

  getPlaylists() {
    const limit = 50;
    const spotifyURL = `https://api.spotify.com/v1/me/playlists?&limit=${limit}`;

    spotifyGetRequest(spotifyURL, this.state.access_token, (myJson) => {
      this.setState({ playlists: myJson.items });
      this.setCurrentPlaylist(myJson.items ? myJson.items[0] : []);
    });
  }

  getUserProfile() {
    const spotifyURL = 'https://api.spotify.com/v1/me';

    spotifyGetRequest(spotifyURL, this.state.access_token, (myJson) => {
      this.setState({ user: myJson });
    });
  }

  setCurrentPlaylist(currentPlaylist) {
    this.setState({ currentPlaylist });
    this.getTracks(currentPlaylist.id);
  }

  setActivePage(activePage) {
    this.setState({ activePage });
  }

  /* Get all the tracks for a given playlist*/
  /* Also gets the stats for all the tracks upon completion */
  getTracks(playlist_id) {
    this.setState({ currentPlaylistTracks: [] });

    if (playlist_id) {
      const spotifyURL = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;
      this.recursivelyGetTracks(spotifyURL);
    }
  }

  /* Recursive function for getting playlist tracks one page at a time */
  /* Calls getTrackStats upon completion */
  recursivelyGetTracks(url) {
    spotifyGetRequest(url, this.state.access_token, (myJson) => {
      this.setState({
        currentPlaylistTracks: this.state.currentPlaylistTracks.concat(myJson.items)
      });
      if (myJson.next) {
        this.recursivelyGetTracks(myJson.next);
      } else {
        this.getTrackStats();
      }
    });
  }

  /* Get audio analysis for all the tracks in the current playlist */
  getTrackStats() {
    this.setState({ currentPlaylistTrackStats: [] });

    const track_ids = this.state.currentPlaylistTracks.map(item => {
      return item.track.id;
    })

    // can only request 100 at a time from the Spotify API
    for (let i = 0; i < track_ids.length; i += 100) {
      let subarray = track_ids.slice(i, i + 100);
      
      let spotifyURL = `https://api.spotify.com/v1/audio-features/?ids=${subarray.toString()}`;

      spotifyGetRequest(spotifyURL, this.state.access_token, (myJson) => {
        this.setState({
          currentPlaylistTrackStats: this.state.currentPlaylistTrackStats.concat(myJson.audio_features)
        });
      });
    }
  }

  renderActiveTab() {
    if (this.state.activeTab === 'OVERVIEW') {
      return <Overview playlist={this.state.currentPlaylist} />
    } else if (this.state.activeTab === 'TRACKS') {
      return <TrackList items={this.state.currentPlaylistTracks} />
    } else if (this.state.activeTab === 'STATS') {
      return <Stats trackStats={this.state.currentPlaylistTrackStats} />
    }
  }

  selectTab(tab) {
    this.setState({ activeTab: tab });
  }

  render() {
    return (
      <div className="Home">
        <Header user={this.state.user} logout={this.logout.bind(this)}></Header>
        <Sidebar
          currentPlaylist={this.state.currentPlaylist}
          playlists={this.state.playlists}
          setCurrentPlaylist={this.setCurrentPlaylist.bind(this)}
          setActivePage={this.setActivePage.bind(this)}
          activePage={this.state.activePage}
        />
        <div className="Home_Main_Content">
          {(() => {
            switch (this.state.activePage) {
              case 'PLAYLIST':
                return (
                  this.state.currentPlaylist.name ? (
                    <div>
                      <PlaylistHeader playlist={this.state.currentPlaylist} access_token={this.state.access_token}></PlaylistHeader>
                      <PlaylistMenu activeTab={this.state.activeTab} selectTab={this.selectTab.bind(this)}></PlaylistMenu>
                      {this.renderActiveTab()}
                    </div>
                  ) : (
                      <p></p>
                    )
                )
              case 'ALL_TRACKS':
                return (
                  <AllTracks
                    access_token={this.state.access_token}
                  />
                )
              default:
                return null;
            }
          })()}
        </div>
        
      </div>
    );
  }
}

Home.propTypes = {
  cookies: instanceOf(Cookies).isRequired,
};

export default withCookies(Home);
