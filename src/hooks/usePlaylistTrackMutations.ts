import { useMutation } from "@tanstack/react-query";
import {
  removeTracksFromPlaylist,
  addTracksToPlaylist,
} from "../api/spotify";

export function useRemoveTracksFromPlaylist() {
  return useMutation({
    mutationFn: async ({
      accessToken,
      playlistId,
      trackUris,
      snapshotId,
    }: {
      accessToken: string;
      playlistId: string;
      trackUris: string[];
      snapshotId: string;
    }) => {
      const result = await removeTracksFromPlaylist(
        accessToken,
        playlistId,
        trackUris,
        snapshotId
      );
      if (!result) throw new Error("Failed to remove tracks");
      return result;
    },
  });
}

export function useAddTracksToPlaylist() {
  return useMutation({
    mutationFn: async ({
      accessToken,
      playlistId,
      trackUris,
    }: {
      accessToken: string;
      playlistId: string;
      trackUris: string[];
    }) => {
      const result = await addTracksToPlaylist(
        accessToken,
        playlistId,
        trackUris
      );
      if (!result) throw new Error("Failed to add tracks");
      return result;
    },
  });
}
