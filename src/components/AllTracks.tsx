import React, { useState } from "react";
import spinner from "../assets/spinner.gif";
import "./AllTracks.css";
import { Track, useTracks } from "../hooks/useTracks";

interface Props {
  access_token: string;
}

const AllTracks = (props: Props): JSX.Element => {
  const [filteredTracks, setFilteredTracks] = useState<Array<Track>>([]);
  const [searchText, setSearchText] = useState("");
  const { allTracks, loading, error } = useTracks(props.access_token);

  const applyFilter = () => {
    let filteredTracks = [];

    for (const track of allTracks) {
      const trackNameMatch = track.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const artistMatch = track.artists
        .map((el: any) => el.name)
        .join()
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const albumMatch = track.album.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      if (trackNameMatch || artistMatch || albumMatch) {
        filteredTracks.push(track);
      }
    }

    setFilteredTracks(filteredTracks);
  };

  const renderFilteredTracks = () => {
    const maxSize = 500;

    if (!filteredTracks) return null;

    return filteredTracks.slice(0, maxSize).map((track) => {
      return (
        <tr key={`${track.playlistName}-${track.id}`} className="TrackList_Row">
          <td className="Tracklist_Playlist">{track.playlistName}</td>
          <td className="Tracklist_Title">{track.name}</td>
          <td className="Tracklist_Artist_Album Tracklist_Artist">
            {track.artists.map((el: any) => el.name).join(", ")}
          </td>
          <td className="Tracklist_Artist_Album Tracklist_Album">
            {track.album.name}
          </td>
        </tr>
      );
    });
  };

  if (error) {
    return <p>ERROR</p>;
  }

  if (loading) {
    return (
      <div className="centered">
        <img src={spinner} className="Spinner" alt="loading..." />
      </div>
    );
  }

  return (
    <div className="AllTracks">
      <p className="PlaylistHeader_Name">Spotify Search</p>
      <p className="PlaylistHeader_Subtitle">
        <span className="Bold">{allTracks.length}</span> total tracks •{" "}
        <span className="Bold">{filteredTracks.length}</span> filtered tracks •{" "}
      </p>
      <p className="PlaylistHeader_Subtitle"></p>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilter();
        }}
      >
        <input
          className="SearchBar"
          placeholder="Search a track name, artist, or album..."
          type="text"
          onChange={(e) => setSearchText(e.target.value)}
          value={searchText}
        />
      </form>
      <div>
        <table className="AllTracks_TrackList">
          <tbody>
            <tr>
              <th className="TrackList_HeaderCell">PLAYLIST</th>
              <th className="TrackList_HeaderCell">TITLE</th>
              <th className="TrackList_HeaderCell TrackList_HeaderCell_Artist">
                ARTIST
              </th>
              <th className="TrackList_HeaderCell TrackList_HeaderCell_Album">
                ALBUM
              </th>
            </tr>
            {renderFilteredTracks()}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllTracks;
