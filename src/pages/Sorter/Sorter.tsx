import { useEffect, useState, useMemo } from "react";
import {
  Box,
  Flex,
  Text,
  Autocomplete,
  UnstyledButton,
  Group,
  Stack,
  Loader,
  Paper,
  Button,
  Modal,
  ActionIcon,
  Menu,
} from "@mantine/core";
import { COLORS } from "../../styles/colors";
import {
  getCachedPlaylists,
  getCachedTracksForPlaylists,
} from "../../api/spotifyCache";
import {
  removeTracksFromPlaylist,
  addTracksToPlaylist,
} from "../../api/spotify";
import { usePlayer } from "../../contexts/PlayerContext";
import type { Track } from "../../hooks/useTracks";
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  getVersionGroupKey,
  getLatestInEachGroup,
} from "../../utilities/playlistVersion";
import {
  getExcludedPlaylistIds,
  excludePlaylist,
  includePlaylist,
} from "../../api/sorterExclusions";

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

const ChevronLeftIcon = () => (
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
    <path d="m15 18-6-6 6-6" />
  </svg>
);

const ChevronRightIcon = () => (
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
    <path d="m9 18 6-6-6-6" />
  </svg>
);

const DotsVerticalIcon = () => (
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
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="5" r="1" />
    <circle cx="12" cy="19" r="1" />
  </svg>
);

const BanIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="m4.9 4.9 14.2 14.2" />
  </svg>
);

function getRecommendations(
  allTracks: Track[],
  currentPlaylistName: string,
  currentArtistNames: string[],
): { playlistName: string; count: number }[] {
  const artistSet = new Set(
    currentArtistNames.map((a) => a.toLowerCase().trim()),
  );
  const byPlaylist = new Map<string, number>();
  for (const t of allTracks) {
    if (t.playlistName === currentPlaylistName) continue;
    const trackArtists = t.artists.map((a) => a.name.toLowerCase().trim());
    const hasOverlap = trackArtists.some((a) => artistSet.has(a));
    if (hasOverlap) {
      byPlaylist.set(t.playlistName, (byPlaylist.get(t.playlistName) ?? 0) + 1);
    }
  }
  return [...byPlaylist.entries()]
    .map(([playlistName, count]) => ({ playlistName, count }))
    .sort((a, b) => b.count - a.count);
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
  const [moveConfirmTarget, setMoveConfirmTarget] = useState<{
    playlistId: string;
    playlistName: string;
  } | null>(null);
  const [removeConfirmOpen, setRemoveConfirmOpen] = useState(false);
  const [removeLoading, setRemoveLoading] = useState(false);
  const [excludedIds, setExcludedIds] = useState<Set<string>>(new Set());
  const [excludeLoading, setExcludeLoading] = useState<string | null>(null);
  const [includeLoading, setIncludeLoading] = useState<string | null>(null);

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
          })),
        );
      }
      if (!cancelled) setPlaylistsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [supabase, spotifyUserId]);

  useEffect(() => {
    if (!supabase || !spotifyUserId) {
      setExcludedIds(new Set());
      return;
    }
    let cancelled = false;
    getExcludedPlaylistIds(supabase, spotifyUserId).then((ids) => {
      if (!cancelled) setExcludedIds(ids);
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
      const items = (entry?.items ?? []) as Array<{
        track?: SpotifyTrackObject;
      }>;
      const valid = items.filter(
        (i) => i?.track?.id && i?.track?.uri,
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
    return getRecommendations(allTracks, selectedPlaylist.name, artistNames);
  }, [allTracks, currentTrack, selectedPlaylist]);

  const sidebarPlaylists = useMemo(() => {
    const nameToId = new Map(playlists.map((p) => [p.name, p.id]));
    const latestByGroup = getLatestInEachGroup(playlists);

    // Aggregate recommendations by version group: sum counts, show only latest
    const groupCounts = new Map<string, number>();
    for (const r of recommendations) {
      const groupKey = getVersionGroupKey(r.playlistName);
      groupCounts.set(groupKey, (groupCounts.get(groupKey) ?? 0) + r.count);
    }
    const withCount: { id: string; name: string; count: number }[] = [];
    for (const [groupKey, count] of groupCounts) {
      const latestName = latestByGroup.get(groupKey);
      if (!latestName) continue;
      const id = nameToId.get(latestName);
      if (!id) continue;
      withCount.push({ id, name: latestName, count });
    }
    withCount.sort((a, b) => b.count - a.count);

    const recommendedGroupKeys = new Set(groupCounts.keys());
    const latestNames = new Set(latestByGroup.values());

    // Only show latest version per group; exclude selected and recommended groups
    const withoutCount = playlists
      .filter(
        (p) =>
          p.id !== selectedPlaylist?.id &&
          latestNames.has(p.name) &&
          !recommendedGroupKeys.has(getVersionGroupKey(p.name)),
      )
      .map((p) => ({
        id: p.id,
        name: p.name,
        count: undefined as number | undefined,
      }));
    const combined = [...withCount, ...withoutCount] as {
      id: string;
      name: string;
      count?: number;
    }[];
    return combined.filter((item) => !excludedIds.has(item.id));
  }, [playlists, recommendations, selectedPlaylist?.id, excludedIds]);

  const excludedPlaylistsForSidebar = useMemo(() => {
    return playlists.filter(
      (p) =>
        excludedIds.has(p.id) &&
        p.id !== selectedPlaylist?.id &&
        selectedPlaylist != null,
    );
  }, [playlists, excludedIds, selectedPlaylist?.id]);

  const handleSelectPlaylist = (name: string) => {
    const p = playlists.find(
      (x) => x.name.toLowerCase() === name.toLowerCase(),
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
        selectedPlaylist.snapshotId,
      );
      if (!removeResult) {
        setMoveLoading(null);
        return;
      }
      const addResult = await addTracksToPlaylist(
        accessToken,
        targetPlaylistId,
        [currentTrack.uri],
      );
      if (!addResult) {
        setMoveLoading(null);
        return;
      }
      setSelectedPlaylist((prev) =>
        prev ? { ...prev, snapshotId: removeResult.snapshot_id } : null,
      );
      setPlaylistItems((prev) => prev.filter((_, i) => i !== currentIndex));
      if (currentIndex >= playlistItems.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
    } finally {
      setMoveLoading(null);
    }
  };

  const handleRemoveFromPlaylist = async () => {
    if (
      !accessToken ||
      !currentTrack?.uri ||
      !selectedPlaylist ||
      removeLoading
    )
      return;
    setRemoveLoading(true);
    try {
      const removeResult = await removeTracksFromPlaylist(
        accessToken,
        selectedPlaylist.id,
        [currentTrack.uri],
        selectedPlaylist.snapshotId,
      );
      if (!removeResult) return;
      setSelectedPlaylist((prev) =>
        prev ? { ...prev, snapshotId: removeResult.snapshot_id } : null,
      );
      setPlaylistItems((prev) => prev.filter((_, i) => i !== currentIndex));
      if (currentIndex >= playlistItems.length - 1 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      setRemoveConfirmOpen(false);
    } finally {
      setRemoveLoading(false);
    }
  };

  if (selectedPlaylist && currentTrack) {
    return (
      <Box
        style={{
          display: "flex",
          flex: 1,
          minWidth: 0,
          minHeight: 0,
        }}
      >
        <Box
          style={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box style={{ padding: 24, paddingBottom: 0, flexShrink: 0 }}>
            <Group align="center" spacing="xs" mb="lg">
              <Text size="sm" c="dimmed">
                Sorting
              </Text>
              <Text size="sm" fw={600}>
                {selectedPlaylist.name}
              </Text>
              <UnstyledButton
                onClick={handleClearPlaylist}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  color: "var(--mantine-color-dark-2)",
                  fontSize: 12,
                }}
              >
                <ClearIcon />
                <span>Clear</span>
              </UnstyledButton>
            </Group>

            <Paper
              p="md"
              radius="md"
              mb="md"
              style={{
                backgroundColor: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                position: "sticky",
                top: 0,
                zIndex: 1,
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
                    {(currentTrack.album?.images?.[0]?.url ??
                      currentTrack.album?.images?.[1]?.url) ? (
                      <img
                        src={
                          currentTrack.album?.images?.[0]?.url ??
                          currentTrack.album?.images?.[1]?.url
                        }
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
                  <Group position="apart" align="center" mt="sm" spacing="xs">
                    <Box />
                    <Button
                      size="xs"
                      variant="light"
                      color="red"
                      onClick={() => setRemoveConfirmOpen(true)}
                    >
                      Remove from playlist
                    </Button>
                  </Group>
                </Box>
              </Group>
            </Paper>
          </Box>

          <Box
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              padding: "0 24px 24px",
            }}
          >
            <style>{`
          .sorter-cover-button:hover .sorter-play-overlay { opacity: 1 !important; }
          .sorter-track-row:hover { background-color: rgba(255,255,255,0.06) !important; }
          .sorter-track-row:hover td { border-bottom-color: rgba(255,255,255,0.06) !important; }
        `}</style>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                tableLayout: "fixed",
              }}
            >
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  zIndex: 1,
                  backgroundColor: COLORS.mainBg,
                  boxShadow: "0 1px 0 0 rgba(255,255,255,0.08)",
                }}
              >
                <tr>
                  <th
                    style={{
                      padding: "6px 12px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--mantine-color-dark-2)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "50%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Track
                  </th>
                  <th
                    style={{
                      padding: "6px 12px",
                      textAlign: "left",
                      borderBottom: "1px solid rgba(255,255,255,0.08)",
                      fontSize: 11,
                      fontWeight: 600,
                      color: "var(--mantine-color-dark-2)",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      width: "50%",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Artist
                  </th>
                </tr>
              </thead>
              <tbody>
                {playlistItems.map((item, i) => {
                  const track = item.track;
                  const isCurrent = i === currentIndex;
                  return (
                    <tr
                      key={track.uri}
                      onClick={() => setCurrentIndex(i)}
                      style={{
                        cursor: "pointer",
                        backgroundColor: isCurrent
                          ? "rgba(255,255,255,0.08)"
                          : "transparent",
                      }}
                      className="sorter-track-row"
                    >
                      <td
                        style={{
                          padding: "6px 12px",
                          paddingLeft: 18,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          verticalAlign: "middle",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 0,
                          boxShadow: isCurrent
                            ? `inset 3px 0 0 0 ${COLORS.primary}`
                            : undefined,
                        }}
                      >
                        <Text size="sm" lineClamp={1} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                          {track.name}
                        </Text>
                      </td>
                      <td
                        style={{
                          padding: "6px 12px",
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                          verticalAlign: "middle",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 0,
                        }}
                      >
                        <Text size="sm" c="dimmed" lineClamp={1} style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
                          {track.artists.map((a) => a.name).join(", ")}
                        </Text>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Box>

          <Modal
            opened={moveConfirmTarget != null}
            onClose={() => setMoveConfirmTarget(null)}
            title="Move track?"
            centered
          >
            {moveConfirmTarget && (
              <Stack spacing="md">
                <Text size="sm" c="dimmed">
                  Move{" "}
                  <Text component="span" fw={600} c="dark.0">
                    {currentTrack.name}
                  </Text>{" "}
                  from{" "}
                  <Text component="span" fw={500}>
                    {selectedPlaylist.name}
                  </Text>{" "}
                  to{" "}
                  <Text component="span" fw={500}>
                    {moveConfirmTarget.playlistName}
                  </Text>
                  ?
                </Text>
                <Group position="right" spacing="xs">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => setMoveConfirmTarget(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    color="green"
                    loading={moveLoading === moveConfirmTarget.playlistId}
                    onClick={async () => {
                      await handleMoveToPlaylist(moveConfirmTarget.playlistId);
                      setMoveConfirmTarget(null);
                    }}
                  >
                    Confirm
                  </Button>
                </Group>
              </Stack>
            )}
          </Modal>

          <Modal
            opened={removeConfirmOpen}
            onClose={() => setRemoveConfirmOpen(false)}
            title="Remove from playlist?"
            centered
          >
            <Stack spacing="md">
              <Text size="sm" c="dimmed">
                Remove{" "}
                <Text component="span" fw={600} c="dark.0">
                  {currentTrack.name}
                </Text>{" "}
                from{" "}
                <Text component="span" fw={500}>
                  {selectedPlaylist.name}
                </Text>
                ? It won’t be added to any other playlist.
              </Text>
              <Group position="right" spacing="xs">
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setRemoveConfirmOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  color="red"
                  loading={removeLoading}
                  onClick={handleRemoveFromPlaylist}
                >
                  Remove
                </Button>
              </Group>
            </Stack>
          </Modal>

          {playlistItems.length > 1 && (
            <Box
              style={{
                flexShrink: 0,
                padding: "12px 24px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 16,
              }}
            >
              <Text size="xs" c="dimmed">
                Track {currentIndex + 1} of {playlistItems.length}
              </Text>
              <Group spacing="xs">
                <UnstyledButton
                  onClick={() =>
                    setCurrentIndex((i) =>
                      i > 0 ? i - 1 : playlistItems.length - 1,
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: COLORS.primary,
                  }}
                  title="Previous track"
                >
                  <ChevronLeftIcon />
                </UnstyledButton>
                <UnstyledButton
                  onClick={() =>
                    setCurrentIndex((i) =>
                      i < playlistItems.length - 1 ? i + 1 : 0,
                    )
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: COLORS.primary,
                  }}
                  title="Next track"
                >
                  <ChevronRightIcon />
                </UnstyledButton>
              </Group>
            </Box>
          )}
        </Box>

        <Box
          style={{
            width: 280,
            flexShrink: 0,
            borderLeft: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
          }}
        >
          <Box
            style={{
              padding: "16px 16px 12px",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              flexShrink: 0,
            }}
          >
            <Text
              size="sm"
              fw={500}
              c="dimmed"
              style={{ display: "flex", alignItems: "center", gap: 8 }}
            >
              <SparklesIcon />
              Recommended playlists
            </Text>
          </Box>
          <Box
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "auto",
              padding: 12,
            }}
          >
            {sidebarPlaylists.length === 0 &&
            excludedPlaylistsForSidebar.length === 0 ? (
              <Text size="sm" c="dimmed">
                No other playlists.
              </Text>
            ) : (
              <Stack spacing="md">
                {sidebarPlaylists.length > 0 ? (
                  <Stack spacing="xs">
                    {sidebarPlaylists.map((item) => (
                  <Group
                    key={item.id}
                    position="apart"
                    noWrap
                    spacing="xs"
                    align="flex-start"
                  >
                    <Box style={{ minWidth: 0, flex: 1 }}>
                      <Text
                        size="sm"
                        fw={500}
                        lineClamp={1}
                        style={{ lineHeight: 1.25, display: "block" }}
                      >
                        {item.name}
                      </Text>
                      <Box
                        style={{
                          height: 18,
                          lineHeight: "18px",
                          fontSize: 12,
                          overflow: "hidden",
                        }}
                      >
                        {item.count != null ? (
                          <Text
                            size="xs"
                            c="dimmed"
                            style={{ lineHeight: "18px", display: "block" }}
                          >
                            {item.count} track{item.count !== 1 ? "s" : ""} by
                            this artist
                          </Text>
                        ) : null}
                      </Box>
                    </Box>
                    <Group spacing={4} noWrap>
                      <Button
                        size="xs"
                        variant="light"
                        color="green"
                        loading={moveLoading === item.id}
                        onClick={() =>
                          setMoveConfirmTarget({
                            playlistId: item.id,
                            playlistName: item.name,
                          })
                        }
                      >
                        Move here
                      </Button>
                      <Menu position="bottom-end" withArrow>
                        <Menu.Target>
                          <ActionIcon
                            size="sm"
                            variant="subtle"
                            color="gray"
                            title="More options"
                            aria-label="More options"
                          >
                            <DotsVerticalIcon />
                          </ActionIcon>
                        </Menu.Target>
                        <Menu.Dropdown>
                          <Menu.Item
                            icon={<BanIcon />}
                            color="red"
                            onClick={async () => {
                              if (!supabase || !spotifyUserId) return;
                              setExcludeLoading(item.id);
                              const ok = await excludePlaylist(
                                supabase,
                                spotifyUserId,
                                item.id,
                              );
                              if (ok) {
                                setExcludedIds((prev) =>
                                  new Set([...prev, item.id]),
                                );
                              }
                              setExcludeLoading(null);
                            }}
                            disabled={excludeLoading === item.id}
                          >
                            Exclude from recommendations
                          </Menu.Item>
                        </Menu.Dropdown>
                      </Menu>
                    </Group>
                  </Group>
                ))}
                  </Stack>
                ) : null}
                {excludedPlaylistsForSidebar.length > 0 ? (
                  <Box>
                    <Text
                      size="xs"
                      fw={500}
                      c="dimmed"
                      mb="xs"
                      style={{
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Excluded
                    </Text>
                    <Stack spacing="xs">
                      {excludedPlaylistsForSidebar.map((p) => (
                        <Group
                          key={p.id}
                          position="apart"
                          noWrap
                          spacing="xs"
                          align="center"
                        >
                          <Text
                            size="sm"
                            c="dimmed"
                            lineClamp={1}
                            style={{
                              minWidth: 0,
                              flex: 1,
                              textDecoration: "line-through",
                            }}
                          >
                            {p.name}
                          </Text>
                          <Button
                            size="xs"
                            variant="subtle"
                            color="gray"
                            loading={includeLoading === p.id}
                            onClick={async () => {
                              if (!supabase || !spotifyUserId) return;
                              setIncludeLoading(p.id);
                              const ok = await includePlaylist(
                                supabase,
                                spotifyUserId,
                                p.id,
                              );
                              if (ok) {
                                setExcludedIds((prev) => {
                                  const next = new Set(prev);
                                  next.delete(p.id);
                                  return next;
                                });
                              }
                              setIncludeLoading(null);
                            }}
                          >
                            Include
                          </Button>
                        </Group>
                      ))}
                    </Stack>
                  </Box>
                ) : null}
              </Stack>
            )}
          </Box>
        </Box>
      </Box>
    );
  }

  if (selectedPlaylist && playlistItems.length === 0) {
    return (
      <Box style={{ flex: 1, minWidth: 0, minHeight: 0, padding: 24 }}>
        <Group align="center" spacing="xs" mb="lg">
          <Text size="sm" c="dimmed">
            Sorting
          </Text>
          <Text size="sm" fw={600}>
            {selectedPlaylist.name}
          </Text>
          <UnstyledButton
            onClick={handleClearPlaylist}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              color: "var(--mantine-color-dark-2)",
              fontSize: 12,
            }}
          >
            <ClearIcon />
            <span>Clear</span>
          </UnstyledButton>
        </Group>
        <Text c="dimmed">This playlist has no tracks in cache yet.</Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        flex: 1,
        minWidth: 0,
        minHeight: 0,
        padding: 24,
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "flex-start",
      }}
    >
      {playlistsLoading ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          gap="md"
          style={{ flex: 1, minHeight: 0, width: "100%" }}
        >
          <Loader color={COLORS.primary} />
          <Text size="sm" c="dimmed">
            Loading playlists...
          </Text>
        </Flex>
      ) : (
        <>
          <Text component="h2" fw={600} size="xl" mb="xs" style={{ lineHeight: 1.3 }}>
            Sort a playlist
          </Text>
          <Text size="sm" c="dimmed" mb="lg">
            Search your playlists and we'll help you move tracks to better fits.
          </Text>
          <Autocomplete
            placeholder="Search playlists by name..."
            value={searchQuery}
            onChange={setSearchQuery}
            data={filteredPlaylists.map((p) => p.name)}
            onItemSubmit={(item) => handleSelectPlaylist(item.value)}
            size="md"
            style={{ width: "100%", maxWidth: 500 }}
            styles={{
              input: { borderRadius: 12 },
            }}
            filter={() => true}
          />
        </>
      )}
    </Box>
  );
}
