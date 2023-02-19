import { clientID, scopes, redirect_uri } from "../utilities/constants";

const SPOTIFY_AUTH_URL =
  "https://accounts.spotify.com/authorize" +
  "?response_type=token" +
  `&client_id=${clientID}` +
  `&scope=${encodeURIComponent(scopes)}` +
  `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
  "&show_dialog=true";

export const authWithSpotify = () => {
  (window.location as any) = SPOTIFY_AUTH_URL;
};
