import React, { Component } from "react";
import "./Sidebar.css";

class Sidebar extends Component {
  constructor(props) {
    super(props);

    this.state = {
      activePlaylist: "",
    };
  }

  renderPlaylists() {
    if (this.props.playlists) {
      return this.props.playlists.map((p) => (
        <li
          className={
            this.props.currentPlaylist.name === p.name &&
            this.props.activePage === "PLAYLIST"
              ? "Sidebar_Playlist_Selected"
              : "Sidebar_Playlist_Unselected"
          }
          key={p.name}
          onClick={() => {
            this.props.setActivePage("PLAYLIST");
            this.props.setCurrentPlaylist(p);
          }}
        >
          {p.name}
        </li>
      ));
    }
  }

  render() {
    return (
      <div className="Sidebar">
        <h4 className="Sidebar_Title_Playlists">LIBRARY</h4>
        <li
          className={
            this.props.activePage === "ALL_TRACKS"
              ? "Sidebar_Playlist_Selected"
              : "Sidebar_Playlist_Unselected"
          }
          onClick={() => {
            this.props.setActivePage("ALL_TRACKS");
          }}
        >
          All Tracks
        </li>
        <h4 className="Sidebar_Title_Playlists">PLAYLISTS</h4>
        {this.renderPlaylists()}
      </div>
    );
  }
}

export default Sidebar;
