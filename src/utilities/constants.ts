/* Constants used throughout the application */

export const clientID = "bc800faa1cb3438da94f230ba04a1e1b";

export const clientSecret = "36d268ad41f24665a02dabe2d5ac8e5a";

export const scopes = "user-read-private user-read-email playlist-read-private";

export const redirect_uri =
  import.meta.env.DEV
    ? `${window.location.origin}${import.meta.env.BASE_URL}`
    : "https://jacobfisher18.github.io/playlist_analyzer/";
