import { clientID, scopes, redirect_uri } from "../utilities/constants";

export const authWithSpotify = () => {
  window.location =
    "https://accounts.spotify.com/authorize" +
    "?response_type=token" +
    "&client_id=" +
    clientID +
    (scopes ? "&scope=" + encodeURIComponent(scopes) : "") +
    "&redirect_uri=" +
    encodeURIComponent(redirect_uri) +
    "&show_dialog=true";
};
