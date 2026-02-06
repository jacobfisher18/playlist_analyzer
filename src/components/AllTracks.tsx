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
import { usePlayer } from "../contexts/PlayerContext";

const MAX_PLAYLIST_TAGS = 10;

interface Props {
  allTracks: Track[];
  loading: boolean;
  error: boolean;
  searchText: string;
  onSearchTextChange: (value: string) => void;
}

const AllTracks = (props: Props): JSX.Element => {
  const [filteredTracks, setFilteredTracks] = useState<Array<Track>>([]);
  const {
    allTracks,
    loading,
    error,
    searchText,
    onSearchTextChange: setSearchText,
  } = props;
  const { playTrack } = usePlayer();

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

  // Single pass: count tracks per playlist, then sort by count descending
  const playlistCounts = filteredTracks.reduce<Map<string, number>>(
    (acc, t) => {
      acc.set(t.playlistName, (acc.get(t.playlistName) ?? 0) + 1);
      return acc;
    },
    new Map(),
  );
  const playlistsByCount = [...playlistCounts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
  const displayedPlaylists = playlistsByCount.slice(0, MAX_PLAYLIST_TAGS);
  const remainingCount = Math.max(
    0,
    playlistsByCount.length - MAX_PLAYLIST_TAGS,
  );

  const renderFilteredTracks = () => {
    const maxSize = 500;
    if (!filteredTracks.length) return null;

    return filteredTracks.slice(0, maxSize).map((track) => (
      <tr
        key={`${track.playlistName}-${track.id}`}
        onDoubleClick={() => playTrack(`spotify:track:${track.id}`)}
      >
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
    <Box mt="lg">
      {/* Single results header: query + count on one line */}
      <Flex
        justify="space-between"
        align="center"
        wrap="wrap"
        gap="xs"
        mb={filteredTracks.length > 0 ? "sm" : "xs"}
      >
        <Text size="sm" c="dimmed">
          Search results for &quot;{searchText.trim()}&quot;
          {filteredTracks.length > 0 && (
            <>
              {" · "}
              <Text component="span" fw={500} c="dark.1">
                {filteredTracks.length} track
                {filteredTracks.length !== 1 ? "s" : ""}
              </Text>
            </>
          )}
        </Text>
      </Flex>

      {/* Playlist context: which playlists these results came from */}
      {filteredTracks.length > 0 && (
        <Group spacing="xs" noWrap={false} mb="md">
          {displayedPlaylists.map(({ name, count }) => (
            <Badge key={name} variant="light" size="sm" radius="sm">
              <span>
                {name}
                <span
                  style={{
                    color: "var(--mantine-color-green-6)",
                    marginLeft: 4,
                    opacity: 0.6,
                  }}
                >
                  ({count})
                </span>
              </span>
            </Badge>
          ))}
          {remainingCount > 0 && (
            <Badge variant="outline" size="sm" radius="sm">
              +{remainingCount} more
            </Badge>
          )}
        </Group>
      )}

      {/* Results: table or empty state */}
      {filteredTracks.length > 0 ? (
        <Box className="search-tracks-table">
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
        </Box>
      ) : (
        <Text size="sm" c="dimmed">
          No tracks match your search.
        </Text>
      )}
    </Box>
  );

  return (
    <Box
      style={{
        minHeight: "100vh",
        padding: 24,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: hasQuery ? "stretch" : "center",
        justifyContent: hasQuery ? "flex-start" : "center",
      }}
    >
      {loading && !hasQuery ? (
        <Flex direction="column" align="center" gap="md">
          <Loader variant="bars" />
          <Text size="sm" c="dimmed">
            Loading tracks from Spotify
          </Text>
        </Flex>
      ) : (
        <Box
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: hasQuery ? "stretch" : "center",
            width: "100%",
          }}
        >
          {!hasQuery && (
            <Title order={2} mb="xl">
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
              styles={{
                input: {
                  borderRadius: 12,
                  width: hasQuery ? "100%" : "500px",
                },
              }}
            />
          </form>

          {hasQuery && <Box mt="lg">{resultsContent}</Box>}
        </Box>
      )}
    </Box>
  );
};

export default AllTracks;
