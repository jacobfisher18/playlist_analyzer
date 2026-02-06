## Playlist Analyzer

This project allows users to search among all their tracks in all of their Spotify playlists.

### Running Locally

1. Copy `.env.example` to `.env` and fill in values (see Supabase below).
2. In the project directory, run:

   `pnpm dev`

   which will run the app (by default at http://localhost:5173/playlist_analyzer/).

### Supabase (optional – for playlist cache)

Migrations are in `supabase/migrations/`. Apply them with the Supabase CLI (no manual Dashboard SQL).

1. **API credentials (for the app)**  
   In [Supabase Dashboard](https://supabase.com/dashboard): your project → **Project Settings** → **API**. Set in `.env`:

   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

2. **One-time CLI setup**  
   From the project root:

   ```bash
   pnpm exec supabase login
   pnpm db:link
   ```

   When linking, use your project's database password (Dashboard → Project Settings → Database).

3. **Apply migrations**  
   Push migrations to the linked project:
   ```bash
   pnpm db:push
   ```
   Then open the app; the landing page should show "Supabase: connected" under the Login button.

To add a new migration: `pnpm exec supabase migration new <name>`, edit the new file in `supabase/migrations/`, then run `pnpm db:push`.

### Deployments

In the project directory, run:

`pnpm deploy`

which will build the app and then publish it with gh-pages.
