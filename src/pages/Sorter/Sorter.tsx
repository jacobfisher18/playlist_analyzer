import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Text,
  Autocomplete,
  UnstyledButton,
  Group,
  Stack,
  Loader,
  Paper,
  Button,
  Divider,
} from "@mantine/core";
import { COLORS } from "../../styles/colors";
import { getCachedPlaylists, getCachedTracksForPlaylists } from "../../api/spotifyCache";
import { removeTracksFromPlaylist, addTracksToPlaylist } from "../../api/spotify";
import { usePlayer } from "../../contexts/PlayerContext";
import type { Track } from "../../hooks/useTracks";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_RECOMMENDATIONS = 5;

/** Spotify track object as returned in playlist items (cache/API) */
export interface SpotifyTrackObject {
  id: string;
  uri: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string; images?: Array<{ url: string }> };
}

interface PlaylistOption {
  id: string;
  name: string;
  snapshot_id: string;
}

interface SorterProps {
  allTracks: Track[];
  accessToken: string | null;
  spotifyUserId: string | null;
  supabase: SupabaseClient | null;
}

const PlayIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ flexShrink: 0 }}
  >
    <polygon points="5 3 19 12 5 21 5 3" />
  </svg>
);

const ClearIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);

const SparklesIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    <path d="M5 3v4" />
    <path d="M19 17v4" />
    <path d="M3 5h4" />
    <path d="M17 19h4" />
  </svg>
);

function getRecommendations(
  allTracks: Track[],
  currentPlaylistName: string,
  currentArtistNames: string[]
): { playlistName: string; count: number }[] {
  const artistSet = new Set(
    currentArtistNames.map((a) => a.toLowerCase().trim())
  );
  const byPlaylist = new Map<string, number>();
  for (const t of allTracks) {
    if (t.playlistName === currentPlaylistName) continue;
    const trackArtists = t.artists.map((a) => a.name.toLowerCase().trim());
    const hasOverlap = trackArtists.some((a) => artistSet.has(a));
    if (hasOverlap) {
      byPlaylist.set(
        t.playlistName,
        (byPlaylist.get(t.playlistName) ?? 0) + 1
      );
    }
  }
  return [...byPlaylist.entries()]
    .map(([playlistName, count]) => ({ playlistName, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, MAX_RECOMMENDATIONS);
}

export default function Sorter({
  allTracks,
  accessToken,
  spotifyUserId,
  supabase,
}: SorterProps): JSX.Element {
  const { playTrack } = usePlayer();
  const [playlists, setPlaylists] = useState<PlaylistOption[]>([]);
  const [playlistsLoading, setPlaylistsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlaylist, setSelectedPlaylist] = useState<{
    id: string;
    name: string;
    snapshotId: string;
  } | null>(null);
  const [playlistItems, setPlaylistItems] = useState<
    Array<{ track: SpotifyTrackObject }>
  >([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [moveLoading, setMoveLoading] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase || !spotifyUserId) {
      setPlaylistsLoading(false);
      return;
    }
    let cancelled = false;
    getCachedPlaylists(supabase, spotifyUserId).then((cached) => {
      if (!cancelled && cached) {
        setPlaylists(
          cached.map((p) => ({
            id: p.id,
            name: p.name,
            snapshot_id: p.snapshot_id ?? "",
          }))
        );
      }
      if (!cancelled) setPlaylistsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, spotifyUserId]);

  useEffect(() => {
    if (!selectedPlaylist || !supabase || !spotifyUserId) {
      setPlaylistItems([]);
      setCurrentIndex(0);
      return;
    }
    let cancelled = false;
    getCachedTracksForPlaylists(supabase, spotifyUserId, [
      selectedPlaylist.id,
    ]).then((map) => {
      if (cancelled) return;
      const entry = map?.get(selectedPlaylist.id);
      const items = (entry?.items ?? []) as Array<{ track?: SpotifyTrackObject }>;
      const valid = items.filter(
        (i) => i?.track?.id && i?.track?.uri
      ) as Array<{ track: SpotifyTrackObject }>;
      setPlaylistItems(valid);
      setCurrentIndex(0);
    });
    return () => {
      cancelled = true;
    };
  }, [selectedPlaylist?.id, supabase, spotifyUserId]);

  const filteredPlaylists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return playlists.slice(0, 20);
    return playlists
      .filter((p) => p.name.toLowerCase().includes(q))
      .slice(0, 20);
  }, [playlists, searchQuery]);

  const currentItem = playlistItems[currentIndex];
  const currentTrack = currentItem?.track;

  const recommendations = useMemo(() => {
    if (!currentTrack || !selectedPlaylist) return [];
    const artistNames = currentTrack.artists.map((a) => a.name);
    return getRecommendations(
      allTracks,
      selectedPlaylist.name,
      artistNames
    );
  }, [allTracks, currentTrack, selectedPlaylist]);

  const recommendationPlaylistIds = useMemo(() => {
    const nameToId = new Map(playlists.map((p) => [p.name, p.id]));
    return recommendations.map((r) => ({
      ...r,
      id: nameToId.get(r.playlistName),
    }));
  }, [playlists, recommendations]);

  const handleSelectPlaylist = (name: string) => {
    const p = playlists.find(
      (x) => x.name.toLowerCase() === name.toLowerCase()
    );
    if (p) {
      setSelectedPlaylist({
        id: p.id,
        name: p.name,
        snapshotId: p.snapshot_id,
      });
      setSearchQuery("");
    }
  };

  const handleClearPlaylist = () => {
    setSelectedPlaylist(null);
    setPlaylistItems([]);
    setCurrentIndex(0);
  };

  const handleMoveToPlaylist = async (targetPlaylistId: string) => {
    if (
      !accessToken ||
      !currentTrack?.uri ||
      !selectedPlaylist ||
      moveLoading != null
    )
      return;
    setMoveLoading(targetPlaylistId);
    try {
      const removeResult = await removeTracksFromPlaylist(
        accessToken,
        selectedPlaylist.id,
        [currentTrack.uri],
        selectedPlaylist.snapshotId
      );
      if (!removeResult) {
        setMoveLoading(null);
        return;
      }
      const addResult = await addTracksToPlaylist(
        accessToken,
        targetPlaylistId,
        [currentTrack.uri]
      );
      if (!addResult) {
        setMoveLoading(null);
        return;
      }
      setSelectedPlaylist((prev) =>
        prev ? { ...prev, snapshotId: removeResult.snapshot_id } : null
      );
      setPlaylistItems((prev) =>
        prev.filter((_, i) => i !== currentIndex)
      );
      if (currentIndex >= playlistItems.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } finally {
      setMoveLoading(null);
    }
  };

  if (selectedPlaylist && currentTrack) {
    const albumImage =
      currentTrack.album?.images?.[0]?.url ??
      currentTrack.album?.images?.[1]?.url;

    return (
      <Box
        style={{
          padding: 24,
          maxWidth: 560,
          margin: "0 auto",
        }}
      >
        <Group position="apart" align="center" mb="lg">
          <Text size="sm" c="dimmed">
            Sorting playlist
          </Text>
          <UnstyledButton
            onClick={handleClearPlaylist}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--mantine-color-dark-2)",
              fontSize: 13,
            }}
          >
            <ClearIcon />
            <span>Clear & search again</span>
          </UnstyledButton>
        </Group>
        <Text fw={600} size="lg" mb="xl">
          {selectedPlaylist.name}
        </Text>

        <Paper
          p="md"
          radius="md"
          style={{
            backgroundColor: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            marginBottom: 24,
          }}
        >
          <Group noWrap spacing="md" align="flex-start">
            <UnstyledButton
              onClick={() => playTrack(currentTrack.uri)}
              onDoubleClick={() => playTrack(currentTrack.uri)}
              style={{ lineHeight: 0, flexShrink: 0 }}
              className="sorter-cover-button"
            >
              <Box
                style={{
                  width: 112,
                  height: 112,
                  borderRadius: 8,
                  overflow: "hidden",
                  backgroundColor: "rgba(0,0,0,0.3)",
                  position: "relative",
                }}
              >
                {albumImage ? (
                  <img
                    src={albumImage}
                    alt=""
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                ) : null}
                <Box
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "rgba(0,0,0,0.4)",
                    opacity: 0,
                    transition: "opacity 0.15s ease",
                  }}
                  className="sorter-play-overlay"
                >
                  <Box style={{ color: "#fff" }}>
                    <PlayIcon />
                  </Box>
                </Box>
              </Box>
            </UnstyledButton>
            <Box
              style={{ flex: 1, minWidth: 0 }}
              onDoubleClick={() => playTrack(currentTrack.uri)}
            >
              <Text fw={600} size="md" lineClamp={1}>
                {currentTrack.name}
              </Text>
              <Text size="sm" c="dimmed" lineClamp={1} mt={4}>
                {currentTrack.artists.map((a) => a.name).join(", ")}
              </Text>
              <Text size="xs" c="dimmed" lineClamp={1} mt={2}>
                {currentTrack.album?.name}
              </Text>
            </Box>
          </Group>
        </Paper>

        <style>{`
          .sorter-cover-button:hover .sorter-play-overlay { opacity: 1 !important; }
        `}</style>

        <Text
          size="sm"
          fw={500}
          c="dimmed"
          mb="sm"
          style={{ display: "flex", alignItems: "center", gap: 8 }}
        >
          <SparklesIcon />
          Recommended playlists
        </Text>
        <Text size="xs" c="dimmed" mb="md">
          Playlists where this artist appears most often
        </Text>

        {recommendationPlaylistIds.length === 0 ? (
          <Text size="sm" c="dimmed">
            No other playlists with this artist in your library.
          </Text>
        ) : (
          <Stack spacing="xs">
            {recommendationPlaylistIds.map(
              (rec) =>
                rec.id && (
                  <Group key={rec.id} position="apart">
                    <Box style={{ minWidth: 0 }}>
                      <Text size="sm" fw={500} lineClamp={1}>
                        {rec.playlistName}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {rec.count} track{rec.count !== 1 ? "s" : ""} by this
                        artist
                      </Text>
                    </Box>
                    <Button
                      size="xs"
                      variant="light"
                      color="green"
                      loading={moveLoading === rec.id}
                      onClick={() => handleMoveToPlaylist(rec.id!)}
                    >
                      Move here
                    </Button>
                  </Group>
                )
            )}
          </Stack>
        )}

        {playlistItems.length > 1 && (
          <>
            <Divider my="xl" />
            <Group position="apart" align="center">
              <Text size="xs" c="dimmed">
                Track {currentIndex + 1} of {playlistItems.length} in this
                playlist
              </Text>
              <UnstyledButton
                onClick={() =>
                  setCurrentIndex((i) =>
                    i < playlistItems.length - 1 ? i + 1 : 0
                  )
                }
                style={{ fontSize: 13, color: COLORS.primary }}
              >
                Next track
              </UnstyledButton>
            </Group>
          </>
        )}
      </Box>
    );
  }

  if (selectedPlaylist && playlistItems.length === 0) {
    return (
      <Box style={{ padding: 24, maxWidth: 560, margin: "0 auto" }}>
        <Group position="apart" align="center" mb="lg">
          <Text size="sm" c="dimmed">
            Sorting playlist
          </Text>
          <UnstyledButton
            onClick={handleClearPlaylist}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              color: "var(--mantine-color-dark-2)",
              fontSize: 13,
            }}
          >
            <ClearIcon />
            <span>Clear & search again</span>
          </UnstyledButton>
        </Group>
        <Text fw={600} size="lg" mb="xl">
          {selectedPlaylist.name}
        </Text>
        <Text c="dimmed">This playlist has no tracks in cache yet.</Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        padding: 24,
        maxWidth: 480,
        margin: "0 auto",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
      }}
    >
      <Text fw={600} size="lg" mb="xs">
        Sort a playlist
      </Text>
      <Text size="sm" c="dimmed" mb="lg">
        Search your playlists and we’ll help you move tracks to better fits.
      </Text>
      {playlistsLoading ? (
        <Loader color={COLORS.primary} />
      ) : (
        <Autocomplete
          placeholder="Search playlists by name..."
          value={searchQuery}
          onChange={setSearchQuery}
          data={filteredPlaylists.map((p) => p.name)}
          onItemSubmit={(item) => handleSelectPlaylist(item.value)}
          size="md"
          style={{ width: "100%" }}
          styles={{
            input: { borderRadius: 12 },
          }}
          filter={() => true}
        />
      )}
    </Box>
  );
}
