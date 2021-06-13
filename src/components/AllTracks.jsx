import React, { Component } from "react";
import spinner from "../assets/spinner.gif";
import "./AllTracks.css";
import {
  getAllTracksForManyPlaylists,
  getAllUserPlaylists,
} from "../api/spotify";

class AllTracks extends Component {
  constructor(props) {
    super(props);

    this.state = {
      playlists: [],
      playlistNameToTracksMap: {},
      filteredTracks: [],
      searchText: "",
      loading: false,
      error: false,
    };
  }

  async componentDidMount() {
    this.setState({ loading: true });

    const playlists = await getAllUserPlaylists(this.props.access_token);

    if (playlists === null) {
      this.setState({ loading: false, error: true });
      return;
    } else if (playlists.length === 0) {
      // TODO: handle when user has 0 playlists
      console.error("Did not find any playlists.");
      this.setState({ loading: false, error: true });
      return;
    }

    const playlistNameToTracksMap = await getAllTracksForManyPlaylists(
      this.props.access_token,
      playlists
    );

    if (playlistNameToTracksMap === null) {
      this.setState({ loading: false, error: true });
      return;
    } else if (
      Object.values(playlistNameToTracksMap).every((item) => item.length === 0)
    ) {
      // TODO: handle an edge case where user has 0 tracks in any playlists
      console.error("Did not find any tracks in any playlists.");
      this.setState({ loading: false, error: true });
    }

    this.setState({ playlistNameToTracksMap }, () => {
      this.applyFilter(() => this.setState({ loading: false }));
    });
  }

  applyFilter(callback) {
    const { playlistNameToTracksMap, searchText } = this.state;

    let filteredTracks = [];

    for (const [playlistName, tracks] of Object.entries(
      playlistNameToTracksMap
    )) {
      for (const trackObj of tracks) {
        const track = trackObj.track;

        if (!track) {
          console.error(`Track does not have expected data`);
          continue;
        }

        // We'll do some validation for expected properties on the data
        if (!track.name || !track.artists || !track.album || !track.id) {
          console.error(`Track does not have expected data`);
          continue;
        }

        const trackNameMatch = track.name
          .toLowerCase()
          .includes(searchText.toLowerCase());

        const joinedArtists = track.artists.map((el) => el.name).join(", ");
        const artistMatch = joinedArtists
          .toLowerCase()
          .includes(searchText.toLowerCase());

        const albumMatch = track.album.name
          .toLowerCase()
          .includes(searchText.toLowerCase());

        if (trackNameMatch || artistMatch || albumMatch) {
          filteredTracks.push({
            key: `${playlistName}-${track.id}`,
            playlistName: playlistName,
            trackName: track.name,
            artist: joinedArtists,
            album: track.album.name,
          });
        }
      }
    }

    this.setState({ filteredTracks }, callback);
  }

  renderFilteredTracks() {
    let { filteredTracks } = this.state;
    const maxSize = 500;

    if (!filteredTracks) return null;

    return filteredTracks.slice(0, maxSize).map((track) => {
      return (
        <tr key={track.key} className="TrackList_Row">
          <td className="Tracklist_Playlist">{track.playlistName}</td>
          <td className="Tracklist_Title">{track.trackName}</td>
          <td className="Tracklist_Artist_Album Tracklist_Artist">
            {track.artist}
          </td>
          <td className="Tracklist_Artist_Album Tracklist_Album">
            {track.album}
          </td>
        </tr>
      );
    });
  }

  numTracks() {
    const { playlistNameToTracksMap } = this.state;
    if (!playlistNameToTracksMap) return 0;

    return Object.values(playlistNameToTracksMap)
      .map((item) => item.length)
      .reduce((acc, curr) => acc + curr, 0);
  }

  filterByKey(key) {
    this.setState((prevState) => {
      return {
        filteredTracks: prevState.filteredTracks.sort((a, b) => {
          return a[key].toLowerCase().localeCompare(b[key].toLowerCase());
        }),
      };
    });
  }

  render() {
    return this.state.error ? (
      <p>ERROR</p>
    ) : this.state.loading ? (
      <div className="centered">
        <img src={spinner} className="Spinner" alt="loading..." />
      </div>
    ) : (
      <div className="AllTracks">
        <p className="PlaylistHeader_Name">Spotify Playlist Analyzer</p>
        <p className="PlaylistSubHeader_Name">
          Search all tracks on all your playlists at once.
        </p>
        <p className="PlaylistHeader_Subtitle">
          <span className="Bold">{this.numTracks()}</span> total tracks •{" "}
          <span className="Bold">{this.state.filteredTracks.length}</span>{" "}
          filtered tracks
        </p>
        <p className="PlaylistHeader_Subtitle"></p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.applyFilter();
          }}
        >
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
                  onClick={() => this.filterByKey("playlistName")}
                >
                  PLAYLIST
                </th>
                <th
                  className="TrackList_HeaderCell"
                  onClick={() => this.filterByKey("trackName")}
                >
                  TITLE
                </th>
                <th
                  className="TrackList_HeaderCell TrackList_HeaderCell_Artist"
                  onClick={() => this.filterByKey("artist")}
                >
                  ARTIST
                </th>
                <th
                  className="TrackList_HeaderCell TrackList_HeaderCell_Album"
                  onClick={() => this.filterByKey("album")}
                >
                  ALBUM
                </th>
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
