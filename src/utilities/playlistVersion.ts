/**
 * Playlist versioning concept: playlists can be versioned (e.g. "favorites [1]", "favorites [2]").
 * Versioned playlists share a base name and are grouped by it.
 */

/** Default format: name ending with " [number]" e.g. "favorite songs [1]" */
const DEFAULT_VERSION_PATTERN = /^(.+?)\s+\[(\d+)\]$/;

/** Parsed playlist version info, or null if name doesn't match version format */
export interface PlaylistVersion {
  baseName: string;
  version: number;
  fullName: string;
}

/**
 * Parse a playlist name as a versioned playlist.
 * Returns null if the name doesn't match the version format.
 */
export function parsePlaylistVersion(
  name: string,
  pattern: RegExp = DEFAULT_VERSION_PATTERN,
): PlaylistVersion | null {
  const match = name.match(pattern);
  if (!match) return null;
  return {
    baseName: match[1].trim(),
    version: parseInt(match[2], 10),
    fullName: name,
  };
}

/**
 * Group key for versioned playlists: base name.
 * Non-versioned playlists use their full name as the key.
 */
export function getVersionGroupKey(name: string): string {
  const parsed = parsePlaylistVersion(name);
  return parsed ? parsed.baseName : name;
}

/**
 * From a list of playlist names, return the latest version per group.
 * For versioned groups: the one with highest version number.
 * For non-versioned: the playlist itself.
 */
export function getLatestInEachGroup(
  playlists: Array<{ name: string }>,
): Map<string, string> {
  const byGroup = new Map<string, { name: string; version: number }>();
  for (const p of playlists) {
    const parsed = parsePlaylistVersion(p.name);
    const groupKey = getVersionGroupKey(p.name);
    const version = parsed?.version ?? 0;
    const existing = byGroup.get(groupKey);
    if (!existing || version > existing.version) {
      byGroup.set(groupKey, { name: p.name, version });
    }
  }
  const result = new Map<string, string>();
  for (const [groupKey, { name }] of byGroup) {
    result.set(groupKey, name);
  }
  return result;
}
