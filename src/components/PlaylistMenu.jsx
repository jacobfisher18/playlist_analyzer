import React, { Component } from 'react';
import { playlist_menu_tabs } from '../utilities/constants.js';
import './PlaylistMenu.css';

class PlaylistMenu extends Component {
  renderTabs() {
    return playlist_menu_tabs.map(tab => (
      <li
        className={this.props.activeTab === tab ? 'PlaylistMenu_Active_Tab' : ''}
        onClick={() => this.props.selectTab(tab)}
        key={tab}
      >
        {tab}
      </li>
    ));
  }

  render() {
    return (
      <div className="PlaylistMenu">
        <ul>
          {this.renderTabs()}
        </ul>
      </div>
    );
  }
}

export default PlaylistMenu;
