export interface SpotifyUser {
  display_name: string;
  email: string;
  id: string;
  images: Array<{
    url: string;
  }>;
}
