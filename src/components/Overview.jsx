import React, { Component } from 'react';
import './Overview.css';

class Overview extends Component {
  render() {
    return (
      <div className="Overview">
        <p>
Owner:
{' '}
{this.props.playlist.owner.display_name}
</p>
        <p>
          {this.props.playlist.public ? 'PUBLIC' : 'PRIVATE'}
          {' | '}
          {this.props.playlist.collaborative ? 'COLLABORATIVE' : 'NOT COLLABORATIVE'}
        </p>
        <p>
{this.props.playlist.tracks.total}
{' '}
tracks
</p>
      </div>
    );
  }
}

export default Overview;
