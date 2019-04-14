import React, { Component } from 'react';
import './TrackList.css';

class TrackList extends Component {
  renderTracks() {
    if (this.props.items) {
      return this.props.items.map(item => (
        <tr
          key={item.track.name}
        >
          <td className="Tracklist_Title">{item.track.name}</td>
          <td className="Tracklist_Artist_Album">{item.track.artists[0].name}</td>
          <td className="Tracklist_Artist_Album">{item.track.album.name}</td>
          <td className="Tracklist_Popularity">{item.track.popularity}</td>
        </tr>
      ));
    }

    return null;
  }

  render() {
    return (
      <div className="TrackList">
        <table>
          <tbody>
            <tr>
              <th>TITLE</th>
              <th>ARTIST</th>
              <th>ALBUM</th>
              <th>POPULARITY</th>
            </tr>
            {this.renderTracks()}
          </tbody>
        </table>
      </div>
    );
  }
}

export default TrackList;
