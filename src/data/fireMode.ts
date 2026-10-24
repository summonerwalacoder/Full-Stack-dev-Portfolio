/**
 * FIRE MODE — Extreme Phonk music configuration.
 *
 * Everything visitors can play is defined here so it can be updated in one
 * place. Each set maps to a real, public Spotify playlist loaded through the
 * official Spotify embed iframe. Playback starts only after an explicit
 * visitor action.
 *
 * Real Spotify playlist IDs only — never invent IDs. Every id below was
 * verified against Spotify's oEmbed endpoint (https://open.spotify.com/oembed),
 * which returns success only for real, embeddable playlists.
 */

export type FireSetId = "extreme" | "brazilian" | "drift" | "gym" | "viral";

export type FireSource = "spotify";

export interface FireSet {
  id: FireSetId;
  /** i18n key for the set label (short). */
  labelKey: string;
  /** i18n key for the one-line set description. */
  descriptionKey: string;
  /** Glyph shown on the set chip. */
  glyph: string;
  source: FireSource;
  /** Spotify playlist id (from the share URL). */
  playlistId: string;
}

/**
 * Curated Extreme Phonk sets. Every set is a real, public Spotify playlist
 * safe to embed without authentication.
 */
export const FIRE_SETS: FireSet[] = [
  {
    id: "extreme",
    labelKey: "fire.set.extreme",
    descriptionKey: "fire.set.extreme.desc",
    glyph: "◆",
    source: "spotify",
    playlistId: "37i9dQZF1EQt8VxTH7fPID",
  },
  {
    id: "brazilian",
    labelKey: "fire.set.brazilian",
    descriptionKey: "fire.set.brazilian.desc",
    glyph: "◤",
    source: "spotify",
    playlistId: "41PZG18MrSTagagiIaiG4X",
  },
  {
    id: "drift",
    labelKey: "fire.set.drift",
    descriptionKey: "fire.set.drift.desc",
    glyph: "≫",
    source: "spotify",
    playlistId: "6VqUZPQ6QNBKnUkc0bjTlE",
  },
  {
    id: "gym",
    labelKey: "fire.set.gym",
    descriptionKey: "fire.set.gym.desc",
    glyph: "▲",
    source: "spotify",
    playlistId: "3OL5heo9PTgpS07zRxdmZ1",
  },
  {
    id: "viral",
    labelKey: "fire.set.viral",
    descriptionKey: "fire.set.viral.desc",
    glyph: "✦",
    source: "spotify",
    playlistId: "0AKPzBcQ1ntwjuoJOIAGht",
  },
];

export const DEFAULT_FIRE_SET: FireSetId = "extreme";

/** Find a set by its local id. */
export function findFireSet(id: FireSetId | null): FireSet | null {
  if (!id) return null;
  return FIRE_SETS.find((s) => s.id === id) ?? null;
}

/** Build the official Spotify embed URL for a playlist (no login required). */
export function fireEmbedUrl(playlistId: string): string {
  return `https://open.spotify.com/embed/playlist/${playlistId}?utm_source=generator&theme=0`;
}
