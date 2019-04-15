import React from 'react';
import './PlaylistHeader.css';

function PlaylistHeader(props) {
  const { playlist } = props;

  return (
    <div className="PlaylistHeader">
      <img className="PlaylistHeader_Image" src={playlist.images && playlist.images[0] ? playlist.images[0].url : ''} alt="playlist img" />
      <div className="PlaylistHeader_Metadata">
        <h3 className="PlaylistHeader_Title">PLAYLIST</h3>
        <h1 className="PlaylistHeader_Name">{playlist.name || ''}</h1>
        <h5 className="PlaylistHeader_TrackCount">
          {`${playlist.tracks.total || 0} tracks`}
        </h5>
      </div>
    </div>
  );
}

export default PlaylistHeader;
