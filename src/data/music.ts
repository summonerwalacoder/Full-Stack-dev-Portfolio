/**
 * App-facing music catalogue. Wraps the auto-generated TRACKS with the genre
 * list, mode groupings, and small query helpers used by the music UI.
 *
 * Genre labels are localized under the i18n key `music.genre.<id>`.
 */
import { TRACKS } from "./tracks";
import type { MusicMode, Track } from "./musicTypes";

export type { Track, MusicMode } from "./musicTypes";

export interface Genre {
  id: string;
  /** i18n key for the genre label. */
  labelKey: string;
  mode: MusicMode;
}

/** The catalogue genres, in display order. Mirrors scripts/_genres.mts.
 *  Fire Mode is Spotify-only, so every catalogue genre belongs to Cheer Mode. */
export const GENRES: Genre[] = [
  { id: "bollywood", labelKey: "music.genre.bollywood", mode: "cheer" },
  { id: "punjabi", labelKey: "music.genre.punjabi", mode: "cheer" },
  { id: "indie", labelKey: "music.genre.indie", mode: "cheer" },
  { id: "intl-pop", labelKey: "music.genre.intlpop", mode: "cheer" },
  { id: "edm-party", labelKey: "music.genre.edmparty", mode: "cheer" },
  { id: "haryanvi", labelKey: "music.genre.haryanvi", mode: "cheer" },
  { id: "tamil", labelKey: "music.genre.tamil", mode: "cheer" },
  { id: "telugu", labelKey: "music.genre.telugu", mode: "cheer" },
  { id: "hiphop", labelKey: "music.genre.hiphop", mode: "cheer" },
  { id: "romantic", labelKey: "music.genre.romantic", mode: "cheer" },
  { id: "rock", labelKey: "music.genre.rock", mode: "cheer" },
];

const GENRE_BY_ID = new Map(GENRES.map((g) => [g.id, g]));

export function isGenreId(id: string | null): boolean {
  return Boolean(id) && GENRE_BY_ID.has(id as string);
}

export function genresForMode(mode: MusicMode): Genre[] {
  return GENRES.filter((g) => g.mode === mode);
}

export function tracksForGenre(genreId: string): Track[] {
  return TRACKS.filter((t) => t.genre === genreId);
}

export function tracksForMode(mode: MusicMode): Track[] {
  const ids = new Set(genresForMode(mode).map((g) => g.id));
  return TRACKS.filter((t) => ids.has(t.genre));
}

export function findTrack(id: string | null): Track | null {
  if (!id) return null;
  return TRACKS.find((t) => t.id === id) ?? null;
}

/** Case-insensitive search over title + artist, limited to a result count. */
export function searchTracks(
  query: string,
  scope: Track[] = TRACKS,
  limit = 60,
): Track[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: Track[] = [];
  for (const t of scope) {
    if (
      t.title.toLowerCase().includes(q) ||
      t.artist?.toLowerCase().includes(q)
    ) {
      out.push(t);
      if (out.length >= limit) break;
    }
  }
  return out;
}

/** Build the official YouTube embed URL for a track (no auth required). */
export function embedUrl(videoId: string, autoplay = 0): string {
  const params = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    playsinline: "1",
    enablejsapi: "1",
  });
  if (autoplay) params.set("autoplay", "1");
  return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
}

/** Canonical watch URL for a track (used for authorized sharing links). */
export function watchUrl(videoId: string): string {
  return `https://www.youtube.com/watch?v=${videoId}`;
}
