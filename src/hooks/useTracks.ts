import { useEffect, useState } from "react";
import {
  getAllUserPlaylists,
  getAllTracksForSinglePlaylist,
} from "../api/spotify";
import {
  getCachedPlaylists,
  getCachedTracksForPlaylists,
  setCachedPlaylists,
  setCachedTracksForPlaylist,
} from "../api/spotifyCache";
import type { SupabaseClient } from "@supabase/supabase-js";

export interface Track {
  id: string;
  playlistName: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string };
}

function buildTracksFromMap(
  playlistNameToTracksMap: Record<string, unknown[]>
): Track[] {
  const newAllTracks: Track[] = [];
  for (const [playlistName, tracks] of Object.entries(playlistNameToTracksMap)) {
    for (const trackObj of tracks as Array<{ track?: unknown }>) {
      const track = trackObj?.track as { id?: string; name?: string; artists?: unknown[]; album?: { name: string } } | undefined;
      if (!track?.name || !track?.artists || !track?.album || !track?.id) continue;
      newAllTracks.push({
        id: track.id,
        name: track.name,
        artists: track.artists as Array<{ name: string }>,
        album: track.album,
        playlistName,
      });
    }
  }
  return newAllTracks;
}

export const useTracks = (
  spotifyAccessToken: string,
  spotifyUserId: string | null,
  supabase: SupabaseClient | null
) => {
  const [allTracks, setAllTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!spotifyAccessToken || !spotifyUserId) return;

    const run = async () => {
      setError(false);

      // 1) Try cache first
      if (supabase) {
        const cachedPlaylists = await getCachedPlaylists(supabase, spotifyUserId);
        if (cachedPlaylists?.length && !cancelled) {
          const playlistIds = cachedPlaylists.map((p) => p.id);
          const cachedTracksMap = await getCachedTracksForPlaylists(
            supabase,
            spotifyUserId,
            playlistIds
          );
          if (cachedTracksMap?.size && !cancelled) {
            const playlistNameToTracks: Record<string, unknown[]> = {};
            let hasAnyTracks = false;
            for (const p of cachedPlaylists) {
              const entry = cachedTracksMap.get(p.id);
              const items = entry?.items ?? [];
              if (items.length) hasAnyTracks = true;
              playlistNameToTracks[p.name] = items;
            }
            if (hasAnyTracks) {
              setAllTracks(buildTracksFromMap(playlistNameToTracks));
              setLoading(false);
            }
          }
        }
      }

      // 2) Background refresh from Spotify
      setIsSyncing(true);
      const playlists = await getAllUserPlaylists(spotifyAccessToken);
      if (cancelled) return;
      if (playlists === null) {
        setError(true);
        setLoading(false);
        setIsSyncing(false);
        return;
      }
      if (!playlists.length) {
        setError(true);
        setLoading(false);
        setIsSyncing(false);
        return;
      }

      const cachedTracksMap =
        spotifyUserId && supabase
          ? await getCachedTracksForPlaylists(
              supabase,
              spotifyUserId,
              playlists.map((p: { id: string }) => p.id)
            )
          : null;

      const playlistNameToTracksMap: Record<string, unknown[]> = {};
      for (const playlist of playlists) {
        const cached = cachedTracksMap?.get(playlist.id);
        const snapshotId = playlist.snapshot_id ?? "";
        if (cached && cached.snapshotId === snapshotId) {
          playlistNameToTracksMap[playlist.name] = cached.items;
        } else {
          const items = await getAllTracksForSinglePlaylist(
            spotifyAccessToken,
            playlist.id
          );
          if (cancelled) return;
          if (items === null) {
            setError(true);
            setIsSyncing(false);
            setLoading(false);
            return;
          }
          playlistNameToTracksMap[playlist.name] = items;
          if (supabase && spotifyUserId) {
            await setCachedTracksForPlaylist(
              supabase,
              spotifyUserId,
              playlist.id,
              snapshotId,
              items
            );
          }
        }
      }

      if (cancelled) return;
      if (
        Object.values(playlistNameToTracksMap).every(
          (items) => !items?.length || items.length === 0
        )
      ) {
        setError(true);
        setLoading(false);
        setIsSyncing(false);
        return;
      }

      setAllTracks(buildTracksFromMap(playlistNameToTracksMap));
      setLoading(false);
      if (supabase && spotifyUserId) {
        await setCachedPlaylists(supabase, spotifyUserId, playlists);
      }
      if (!cancelled) setIsSyncing(false);
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [spotifyAccessToken, spotifyUserId, supabase]);

  return {
    allTracks,
    loading,
    isSyncing,
    error,
  };
};
