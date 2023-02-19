import { useEffect, useState } from "react";
import {
  getAllTracksForManyPlaylists,
  getAllUserPlaylists,
} from "../api/spotify";

export interface Track {
  id: string;
  playlistName: string;
  name: string;
  artists: Array<{ name: string }>;
  album: { name: string };
}

export const useTracks = (spotifyAccessToken: string) => {
  const [allTracks, setAllTracks] = useState<Array<Track>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    const init = async () => {
      setLoading(true);

      const playlists = await getAllUserPlaylists(spotifyAccessToken);

      if (playlists === null) {
        setLoading(false);
        setError(true);
        return;
      }

      if (!playlists.length) {
        // TODO: handle when user has 0 playlists
        console.error("Did not find any playlists.");
        setLoading(false);
        setError(true);
        return;
      }

      const playlistNameToTracksMap = await getAllTracksForManyPlaylists(
        spotifyAccessToken,
        playlists
      );

      if (playlistNameToTracksMap === null) {
        setLoading(false);
        setError(true);
        return;
      }

      if (
        Object.values(playlistNameToTracksMap).every(
          (item) => item.length === 0
        )
      ) {
        // TODO: handle an edge case where user has 0 tracks in any playlists
        console.error("Did not find any tracks in any playlists.");
        setLoading(false);
        setError(true);
        return;
      }

      const newAllTracks: Array<Track> = [];
      for (const [playlistName, tracks] of Object.entries(
        playlistNameToTracksMap
      )) {
        for (const trackObj of tracks) {
          const track = trackObj.track;

          // We'll do some validation for expected properties on the data
          // TODO: Push this up into client
          if (!track.name || !track.artists || !track.album || !track.id) {
            console.error(`Track does not have expected data`);
            continue;
          }
          newAllTracks.push({ ...track, playlistName });
        }
      }

      setAllTracks(newAllTracks);

      // This was previously happening after the set state, not sure what's up here
      //   applyFilter();
      setLoading(false);
    };

    init();
  }, []);

  return {
    allTracks,
    loading,
    error,
  };
};
