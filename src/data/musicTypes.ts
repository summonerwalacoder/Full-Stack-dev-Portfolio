/**
 * Shared types for the music library used by Cheer Mode and Fire Mode.
 *
 * A "Track" is a single song entry. Playback is delivered through the official
 * YouTube IFrame Player API (the only provider that carries this catalogue in
 * full length without a login). `verified` reflects whether the video id was
 * confirmed embeddable via YouTube's oEmbed endpoint at build time.
 */

export type MusicSource = "youtube";

export interface Track {
  /** Stable local id. */
  id: string;
  /** Genre id (see GENRES). */
  genre: string;
  title: string;
  artist?: string;
  source: MusicSource;
  /** YouTube video id, or null when no embeddable match was found. */
  videoId: string | null;
  /** True when the video id was confirmed embeddable. */
  verified: boolean;
  thumbnailUrl?: string;
  watchUrl?: string;
  availability?: "public-embeddable" | "unavailable";
  viewCount?: number;
  publishedAt?: string;
  /** Optional human note about resolution (e.g. "not embeddable"). */
  note?: string;
}

export type MusicMode = "cheer" | "fire";
