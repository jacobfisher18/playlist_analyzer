import { useEffect, useState } from "react";
import { Track } from "../hooks/useTracks";
import {
  TextInput,
  Table,
  Loader,
  Container,
  Text,
  Title,
  Badge,
  Box,
  Flex,
  Group,
} from "@mantine/core";

const MAX_PLAYLIST_TAGS = 10;

interface Props {
  allTracks: Track[];
  loading: boolean;
  error: boolean;
}

const AllTracks = (props: Props): JSX.Element => {
  const [filteredTracks, setFilteredTracks] = useState<Array<Track>>([]);
  const [searchText, setSearchText] = useState("");
  const { allTracks, loading, error } = props;

  const hasQuery = searchText.trim() !== "";

  useEffect(() => {
    applyFilter();
  }, [allTracks, searchText]);

  const applyFilter = () => {
    const query = searchText.trim().toLowerCase();
    if (!query) {
      setFilteredTracks([]);
      return;
    }

    const filtered = allTracks.filter((track) => {
      const trackNameMatch = track.name.toLowerCase().includes(query);
      const artistMatch = track.artists
        .map((el: { name: string }) => el.name)
        .join()
        .toLowerCase()
        .includes(query);
      const albumMatch = track.album.name.toLowerCase().includes(query);
      return trackNameMatch || artistMatch || albumMatch;
    });

    setFilteredTracks(filtered);
  };

  const uniquePlaylists = [
    ...new Set(filteredTracks.map((t) => t.playlistName)),
  ];
  const displayedPlaylists = uniquePlaylists.slice(0, MAX_PLAYLIST_TAGS);
  const remainingCount = uniquePlaylists.length - MAX_PLAYLIST_TAGS;

  const renderFilteredTracks = () => {
    const maxSize = 500;
    if (!filteredTracks.length) return null;

    return filteredTracks.slice(0, maxSize).map((track) => (
      <tr key={`${track.playlistName}-${track.id}`}>
        <td>{track.playlistName}</td>
        <td>{track.name}</td>
        <td>
          {track.artists.map((el: { name: string }) => el.name).join(", ")}
        </td>
        <td>{track.album.name}</td>
      </tr>
    ));
  };

  if (error) {
    return (
      <Container p="sm">
        <Text>There was an error retrieving tracks from Spotify.</Text>
      </Container>
    );
  }

  const resultsContent = hasQuery && (
    <Box>
      <Text size="sm" c="dimmed" mb="xs">
        Search results for &quot;{searchText.trim()}&quot;
      </Text>

      {filteredTracks.length > 0 && (
        <Group spacing="xs" noWrap={false} mb="md">
          {displayedPlaylists.map((name) => (
            <Badge key={name} variant="light" size="sm" radius="sm">
              {name}
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" size="sm" radius="sm">
              +{remainingCount} more
            </Badge>
          )}
        </Group>
      )}

      <Text size="sm" c="dimmed" mb="sm">
        {filteredTracks.length} track
        {filteredTracks.length !== 1 ? "s" : ""} found
      </Text>

      {filteredTracks.length > 0 ? (
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
      ) : (
        <Text size="sm" c="dimmed">
          No tracks match your search.
        </Text>
      )}
    </Box>
  );

  return (
    <Flex
      direction="column"
      align="center"
      justify="flex-start"
      style={{ minHeight: "calc(100vh - 60px)", padding: 16 }}
    >
      <Container
        p="sm"
        style={{
          width: "100%",
          maxWidth: hasQuery ? 900 : 520,
        }}
      >
        {loading && !hasQuery ? (
          <Flex direction="column" align="center" gap="md" mt="xl">
            <Loader variant="bars" />
            <Text size="sm" c="dimmed">
              Loading tracks from Spotify
            </Text>
          </Flex>
        ) : (
          <>
            {!hasQuery && (
              <Title order={2} align="center" mt="md" mb="xl">
                Search across all your playlists
              </Title>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                applyFilter();
              }}
            >
              <TextInput
                size="md"
                disabled={loading}
                placeholder="Search a track name, artist, or album..."
                value={searchText}
                onChange={(event) => setSearchText(event.currentTarget.value)}
                styles={
                  hasQuery
                    ? undefined
                    : {
                        input: {
                          textAlign: "center",
                          borderRadius: 12,
                        },
                      }
                }
              />
            </form>

            {hasQuery && <Box mt="lg">{resultsContent}</Box>}
          </>
        )}
      </Container>
    </Flex>
  );
};

export default AllTracks;
