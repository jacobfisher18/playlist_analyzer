import React, { Component } from 'react';
import './PlaylistHeader.css';

class PlaylistHeader extends Component {
  render() {
    return (
      <div className="PlaylistHeader">
        <img className="PlaylistHeader_Image" src={this.props.playlist.images && this.props.playlist.images[0]  ? this.props.playlist.images[0].url : ''} alt="playlist img" />
        <div className="PlaylistHeader_Metadata">
          <h3 className="PlaylistHeader_Title">PLAYLIST</h3>
          <h1 className="PlaylistHeader_Name">{this.props.playlist.name || ''}</h1>
          <h5 className="PlaylistHeader_TrackCount">
            {`${this.props.playlist.tracks.total || 0} tracks`}
          </h5>
        </div>
      </div>
    );
  }
}

export default PlaylistHeader;
