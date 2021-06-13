import React from "react";
import "./Overview.css";

function Overview(props) {
  const { playlist } = props;

  return (
    <div className="Overview">
      <p>Owner: {playlist.owner.display_name}</p>
      <p>
        {playlist.public ? "PUBLIC" : "PRIVATE"}
        {" | "}
        {playlist.collaborative ? "COLLABORATIVE" : "NOT COLLABORATIVE"}
      </p>
      <p>{playlist.tracks.total} tracks</p>
    </div>
  );
}

export default Overview;
