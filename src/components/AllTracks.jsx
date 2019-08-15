import React, { Component } from 'react';
import { spotifyGetRequest } from '../utilities/apiRequests'
import spinner from '../assets/spinner.gif'
import './AllTracks.css';

class AllTracks extends Component {

  constructor(props) {
    super(props);

    this.state = {
      playlists: [],
      tracks: [],
      filteredTracks: [],
      searchText: '',
      loading: false,
      error: false,
    };
  }

  componentDidMount() {
    this.setState({ loading: true })
    this.getPlaylists().then(() => {
      this.getAllTracks().then(() => {
        this.applyFilter(() => this.setState({ loading: false }));
      }, () => this.setState({ error: true }))
    }, () => this.setState({ error: true }))
  }

  getAllTracks() {
    const promises = [];
    for (let i = 0; i < this.state.playlists.length; i++) {
      promises.push(this.getTracks(this.state.playlists[i].id, this.state.playlists[i].name))
    }

    return Promise.all(promises);
  }

  // calls recursivelyGetPlaylists to get all the user's playlists
  getPlaylists() {
    this.setState({ playlists: [] })
    const limit = 50;
    const spotifyURL = `https://api.spotify.com/v1/me/playlists?&limit=${limit}`;

    return new Promise((res, rej) => {
      this.recursivelyGetPlaylists(spotifyURL).then(() => {
        res();
      }, () => {
        rej();
      })
    })
  }

  // recursively gets user's playlists 50 at a time from spotify api
  recursivelyGetPlaylists(url) {
    return new Promise((resolve, reject) => {
      spotifyGetRequest(url, this.props.access_token, (myJson) => {
        this.setState({
          playlists: this.state.playlists.concat(myJson.items)
        });
        if (myJson.next) {
          this.recursivelyGetPlaylists(myJson.next).then(() => {
            resolve();
          }, () => {
            reject();
          });
        } else {
          if (this.state.playlists.length === 0) {
            reject();
          } else {
            resolve();
          }
        }
      })
    })
  }

  /* Get all the tracks for a given playlist*/
  getTracks(playlist_id, playlist_name) {
    const spotifyURL = `https://api.spotify.com/v1/playlists/${playlist_id}/tracks`;

    return new Promise((res, rej) => {
      this.recursivelyGetTracks([], spotifyURL, playlist_id, playlist_name).then(() => {
        res();
      }, () => {
        rej();
      })
    })
  }

  /* Recursive function for getting playlist tracks one page at a time */
  recursivelyGetTracks(result, url, playlist_id, playlist_name) {
    return new Promise((resolve, reject) => {
      spotifyGetRequest(url, this.props.access_token, (myJson) => {
        result = result.concat(myJson.items)
        if (myJson.next) {
          this.recursivelyGetTracks(result, myJson.next, playlist_id, playlist_name).then(() => {
            resolve();
          }, () => {
            reject();
          });
        } else {
          if (result.length === 0) reject();
          else {
            this.setState(prevState => ({
              tracks: prevState.tracks.concat([{
                playlist_name,
                playlist_id,
                items: result,
              }])
            }), () => resolve());
          }
        }
      });
    })
  }

  applyFilter(callback) {
    const { tracks, searchText } = this.state;

    let filteredTracks = [];

    for (let i = 0; i < tracks.length; i++) {
      for (let j = 0; j < tracks[i].items.length; j++) {
        const trackNameMatch =
          (tracks[i].items[j].track.name).toLowerCase()
            .includes(searchText.toLowerCase())
        
        const artistMatch =
          tracks[i].items[j].track.artists.map(el => el.name).join(' ').toLowerCase()
            .includes(searchText.toLowerCase())
        
        const albumMatch =
          (tracks[i].items[j].track.album.name).toLowerCase()
            .includes(searchText.toLowerCase())

        if (trackNameMatch || artistMatch || albumMatch) {
          filteredTracks.push({
            key: `${tracks[i].playlist_name}-${tracks[i].items[j].track.id}`,
            playlist_name: tracks[i].playlist_name,
            trackName: tracks[i].items[j].track.name,
            artist: tracks[i].items[j].track.artists.map(el => el.name).join(', '),
            album: tracks[i].items[j].track.album.name,
          })
        }
      }
    }

    this.setState({ filteredTracks }, callback);
  }

  renderFilteredTracks() {
    let { filteredTracks } = this.state
    const maxSize = 500;

    if (!filteredTracks) return null;

    return filteredTracks.slice(0, maxSize).map((track) => {
      return (
        <tr key={track.key} className="TrackList_Row">
          <td className="Tracklist_Playlist">{track.playlist_name}</td>
          <td className="Tracklist_Title">{track.trackName}</td>
          <td className="Tracklist_Artist_Album">{track.artist}</td>
          <td className="Tracklist_Artist_Album">{track.album}</td>
        </tr>
      )
    })
  }

  numTracks() {
    if (!(this.state.tracks) || this.state.tracks.length === 0) return 0;

    return this.state.tracks.reduce((accumulator, currentValue) => {
      return accumulator + currentValue.items.length;
    }, 0)
  }

  filterByKey(key) {
    this.setState((prevState) => {
      return {
        filteredTracks: prevState.filteredTracks.sort((a, b) => {
          return a[key].toLowerCase().localeCompare(b[key].toLowerCase());
        })
      }
    });
  }

  render() {
    return (
      this.state.error ? <p>ERROR</p> :
        this.state.loading ? <div className="centered"><img src={spinner} className="Spinner" alt="loading..." /></div> :
      <div className="AllTracks">
          <p className="PlaylistHeader_Name">All Tracks</p>
            <p className="PlaylistHeader_Subtitle">
              <span className="Bold">{this.numTracks()}</span> total tracks • <span className="Bold">{this.state.filteredTracks.length}</span> filtered tracks
            </p>
            <p className="PlaylistHeader_Subtitle"></p>
          <form onSubmit={(e) => { e.preventDefault(); this.applyFilter() }}>
          <input
            className="SearchBar"
            placeholder="Search a track name, artist, or album..."
            type="text"
            onChange={(e) => this.setState({ searchText: e.target.value })}
            value={this.state.searchText}
            />
        </form>
        <div>
          <table className="AllTracks_TrackList">
            <tbody>
              <tr>
                <th
                  className="TrackList_HeaderCell"
                  onClick={() => this.filterByKey('playlist_name')}
                >PLAYLIST</th>
                <th
                  className="TrackList_HeaderCell"
                  onClick={() => this.filterByKey('trackName')}
                >TITLE</th>
                <th
                  className="TrackList_HeaderCell"
                  onClick={() => this.filterByKey('artist')}
                >ARTIST</th>
                <th
                  className="TrackList_HeaderCell"
                  onClick={() => this.filterByKey('album')}
                >ALBUM</th>
              </tr>
                {this.renderFilteredTracks()}
            </tbody>
          </table>
        </div>
      </div>
    );
  }
}

export default AllTracks;
