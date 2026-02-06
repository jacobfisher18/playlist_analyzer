import { useEffect, useState } from "react";
import { Track, useTracks } from "../hooks/useTracks";
import {
  Title,
  TextInput,
  Table,
  Loader,
  Container,
  Space,
  Text,
} from "@mantine/core";
import type { SupabaseClient } from "@supabase/supabase-js";

interface Props {
  accessToken: string;
  spotifyUserId: string | null;
  supabase: SupabaseClient | null;
}

const AllTracks = (props: Props): JSX.Element => {
  const [filteredTracks, setFilteredTracks] = useState<Array<Track>>([]);
  const [searchText, setSearchText] = useState("");
  const { allTracks, loading, error, isSyncing } = useTracks(
    props.accessToken,
    props.spotifyUserId,
    props.supabase
  );

  useEffect(() => {
    applyFilter();
  }, [allTracks]);

  const applyFilter = () => {
    let filteredTracks = [];

    for (const track of allTracks) {
      const trackNameMatch = track.name
        .toLowerCase()
        .includes(searchText.toLowerCase());

      const artistMatch = track.artists
        .map((el: { name: string }) => el.name)
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
          <td>{track.artists.map((el: { name: string }) => el.name).join(", ")}</td>
          <td>{track.album.name}</td>
        </tr>
      );
    });
  };

  if (error) {
    return <Text>There was an error retrieving tracks from Spotify.</Text>;
  }

  return (
    <Container p="sm">
      {isSyncing && (
        <>
          <Loader size="sm" />
          <Text size="sm" c="dimmed" mb="xs">
            Syncing with Spotify…
          </Text>
          <Space h="sm" />
        </>
      )}
      <Title order={1}>Sortify</Title>
      <Space h="sm" />
      <form
        onSubmit={(e) => {
          e.preventDefault();
          applyFilter();
        }}
      >
        <TextInput
          disabled={loading}
          placeholder="Search a track name, artist, or album..."
          value={searchText}
          onChange={(event) => setSearchText(event.currentTarget.value)}
        />
      </form>
      <Space h="xl" />

      {loading ? (
        <Container
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            paddingTop: 100,
          }}
        >
          <Loader variant="bars" />
          <Space h="sm" />
          <Title order={5}>Loading tracks from Spotify</Title>
        </Container>
      ) : (
        <>
          <Title order={5}>
            {allTracks.length} total tracks • {filteredTracks.length} filtered
            tracks
          </Title>
          <Space h="sm" />
          <div>
            <Table>
              <thead>
                <tr>
                  <th>Playlist</th>
                  <th>Title</th>
                  <th>Artist</th>
                  <th>Album</th>
                </tr>
              </thead>
              <tbody>{renderFilteredTracks()}</tbody>
            </Table>
          </div>
        </>
      )}
    </Container>
  );
};

export default AllTracks;
