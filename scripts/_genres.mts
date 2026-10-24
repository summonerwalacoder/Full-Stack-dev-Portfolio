// The music-library genres. Shared by the resolver script and (via copy)
// the app data model. Genre labels are localized in i18n under "music.genre.<id>".
// Phonk is intentionally absent: Fire Mode plays Spotify phonk playlists and is
// not part of the YouTube-resolved catalogue.
export interface GenreSeed {
  id: string;
  label: string;
  /** Music mode this genre belongs to in the UI. */
  mode: "cheer" | "fire";
}

export const GENRES: GenreSeed[] = [
  { id: "bollywood", label: "Bollywood & Hindi Hits", mode: "cheer" },
  { id: "punjabi", label: "Punjabi Hits", mode: "cheer" },
  { id: "indie", label: "Indie & Indian Independent Artists", mode: "cheer" },
  { id: "intl-pop", label: "International Pop", mode: "cheer" },
  { id: "edm-party", label: "EDM & Party", mode: "cheer" },
  { id: "haryanvi", label: "Haryanvi Hits", mode: "cheer" },
  { id: "tamil", label: "Tamil Hits", mode: "cheer" },
  { id: "telugu", label: "Telugu Hits", mode: "cheer" },
  { id: "hiphop", label: "Hip-Hop & Rap", mode: "cheer" },
  { id: "romantic", label: "Romantic & Chill", mode: "cheer" },
  { id: "rock", label: "Rock & Alternative", mode: "cheer" },
];

export const GENRE_IDS = GENRES.map((g) => g.id);
