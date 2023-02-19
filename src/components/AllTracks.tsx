import React, { useState } from "react";
import { Track, useTracks } from "../hooks/useTracks";
import {
  Title,
  TextInput,
  Table,
  Loader,
  Center,
  Container,
  Space,
} from "@mantine/core";

interface Props {
  accessToken: string;
}

const AllTracks = (props: Props): JSX.Element => {
  const [filteredTracks, setFilteredTracks] = useState<Array<Track>>([]);
  const [searchText, setSearchText] = useState("");
  const { allTracks, loading, error } = useTracks(props.accessToken);

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
        <tr key={`${track.playlistName}-${track.id}`}>
          <td>{track.playlistName}</td>
          <td>{track.name}</td>
          <td>{track.artists.map((el: any) => el.name).join(", ")}</td>
          <td>{track.album.name}</td>
        </tr>
      );
    });
  };

  if (error) {
    return <p>ERROR</p>;
  }

  if (loading) {
    return (
      <Center>
        <Loader variant="bars" />
      </Center>
    );
  }

  return (
    <Container p="sm">
      <Title order={1}>Spotify Search</Title>
      <Space h="sm" />
      <Title order={5}>
        {allTracks.length} total tracks • {filteredTracks.length} filtered
        tracks
      </Title>
      <Space h="sm" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilter();
        }}
      >
        <TextInput
          placeholder="Search a track name, artist, or album..."
          value={searchText}
          onChange={(event) => setSearchText(event.currentTarget.value)}
        />
      </form>
      <Space h="sm" />
      <div>
        <Table>
          <thead>
            <tr>
              <th>PLAYLIST</th>
              <th>TITLE</th>
              <th>ARTIST</th>
              <th>ALBUM</th>
            </tr>
          </thead>
          <tbody>{renderFilteredTracks()}</tbody>
        </Table>
      </div>
    </Container>
  );
};

export default AllTracks;
