import { sleep } from "../utilities/time";

const MAX_PLAYLISTS_PER_REQUEST = 50;

const GET_USER_PROFILE_URL = "https://api.spotify.com/v1/me";
const GET_ALL_USER_PLAYLISTS_URL = `https://api.spotify.com/v1/me/playlists?&limit=${MAX_PLAYLISTS_PER_REQUEST}`;
const GET_PLAYLIST_TRACKS_URL = (playlistId: string) =>
  `https://api.spotify.com/v1/playlists/${playlistId}/tracks`;

/**
 * A generic request to the Spotify API; all fetches should use this
 */
const spotifyGetRequest = async (
  spotifyURL: string,
  accessToken: string
): Promise<any> => {
  const response = await fetch(spotifyURL, {
    method: "GET",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (response.status === 200) {
    return response.json();
  } else if (response.status === 429) {
    const retryAfterHeader = response.headers.get("retry-after");
    if (!retryAfterHeader) {
      throw new Error(`Rate limited but could not get retry-after value`);
    }
    const retryAfterSeconds = parseInt(retryAfterHeader);
    if (retryAfterSeconds > 10) {
      throw new Error(
        `Rate limited with a long retry-after of ${retryAfterSeconds} seconds, not retrying`
      );
    }
    console.log(`Rate limited, retrying in ${retryAfterSeconds} seconds`);
    await sleep(retryAfterSeconds * 1000);
    return await spotifyGetRequest(spotifyURL, accessToken);
  } else {
    throw new Error(`Recieved ${response.status} when fetching`);
  }
};

/**
 * Gets the current user profile, or null if it fails
 */
export const getUserProfile = async (accessToken: string) => {
  try {
    const user = await spotifyGetRequest(GET_USER_PROFILE_URL, accessToken);
    return user;
  } catch (err) {
    console.error("Error getting the current user profile", err);
    return null;
  }
};

/**
 * Get all playlists for the current user, or null if it fails
 */
export const getAllUserPlaylists = async (accessToken: string) => {
  try {
    const playlists = [];
    let more = true;
    let pageUrl = GET_ALL_USER_PLAYLISTS_URL;

    while (more) {
      const response = await spotifyGetRequest(pageUrl, accessToken);
      playlists.push(...response.items);
      if (response.next) {
        pageUrl = response.next;
      } else {
        more = false;
      }

      // Sleep a bit to try to avoid getting rate limited
      await sleep(250);
    }
    return playlists;
  } catch (err) {
    console.error("Error getting all user playlists", err);
    return null;
  }
};

/**
 * Get all the tracks for a given set of playlists. Returns a map from the playlist
 * name to the array of tracks. Returns null if any of the fetches fail.
 */
export const getAllTracksForManyPlaylists = async (
  accessToken: string,
  playlists: Array<any>
) => {
  // We'll use parallel arrays for these
  const promises = [];
  const playlistNames = [];
  for (const playlist of playlists) {
    promises.push(getAllTracksForSinglePlaylist(accessToken, playlist.id));
    playlistNames.push(playlist.name);
  }

  const promiseResults = await Promise.all(promises);

  // Since we're using parallel arrays we need to make sure they're in sync
  const noNulls = promiseResults.every((item) => item !== null);
  if (promiseResults.length !== playlistNames.length || !noNulls) {
    console.error("Error fetching all tracks in all playlists");
    return null;
  }

  const playlistNameToTracksMap: Record<string, any> = {};
  for (let i = 0; i < promiseResults.length; i++) {
    playlistNameToTracksMap[playlistNames[i]] = promiseResults[i];
  }

  return playlistNameToTracksMap;
};

/**
 * Get all tracks in a given Spotify playlist. Returns null if it fails.
 */
export const getAllTracksForSinglePlaylist = async (
  accessToken: string,
  playlistId: string
) => {
  try {
    const tracks = [];
    let more = true;
    let pageUrl = GET_PLAYLIST_TRACKS_URL(playlistId);

    while (more) {
      const response = await spotifyGetRequest(pageUrl, accessToken);
      tracks.push(...response.items);
      if (response.next) {
        pageUrl = response.next;
      } else {
        more = false;
      }
    }
    return tracks;
  } catch (err) {
    console.error(`Error getting tracks for playlist ${playlistId}`, err);
    return null;
  }
};
