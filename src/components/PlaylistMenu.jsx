import React, { Component } from "react";
import { playlist_menu_tabs } from "../utilities/constants";
import "./PlaylistMenu.css";

class PlaylistMenu extends Component {
  renderTabs() {
    const { activeTab, selectTab } = this.props;

    return playlist_menu_tabs.map((tab) => (
      <li
        className={activeTab === tab ? "PlaylistMenu_Active_Tab" : ""}
        onClick={() => selectTab(tab)}
        key={tab}
      >
        {tab}
      </li>
    ));
  }

  render() {
    return (
      <div className="PlaylistMenu">
        <ul>{this.renderTabs()}</ul>
      </div>
    );
  }
}

export default PlaylistMenu;
