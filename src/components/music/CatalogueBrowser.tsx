"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import {
  GENRES,
  findTrack,
  genresForMode,
  searchTracks,
  tracksForGenre,
  tracksForMode,
} from "@/data/music";
import type { MusicMode, Track } from "@/data/musicTypes";
import { useMusic } from "./MusicProvider";
import { AudioPlayer } from "./AudioPlayer";

const FAVOURITES_KEY = "sumit.music.favourites";

function readFavourites(): string[] {
  try {
    const raw = window.localStorage.getItem(FAVOURITES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

export interface CatalogueBrowserProps {
  mode: MusicMode;
  /** Whether the owning panel is open (used to gate tab focus). */
  open: boolean;
  /** Track id to auto-play when set (e.g. from a Bobo recommendation). */
  playRequest?: string | null;
  onPlayRequestHandled?: () => void;
}

/**
 * Genre + search + favourites browser over the shared catalogue. Selecting a
 * track hands it to the single shared player so only one song can ever play.
 */
export function CatalogueBrowser({
  mode,
  open,
  playRequest = null,
  onPlayRequestHandled,
}: CatalogueBrowserProps) {
  const { t } = useI18n();
  const { play, toggle, current, origin, status } = useMusic();

  const modeGenres = useMemo(() => genresForMode(mode), [mode]);
  const [genreId, setGenreId] = useState<string>(modeGenres[0]?.id ?? "");
  const [query, setQuery] = useState("");
  const [showFavourites, setShowFavourites] = useState(false);
  const [favourites, setFavourites] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setFavourites(readFavourites());
  }, []);

  useEffect(() => {
    if (modeGenres.length && !modeGenres.some((g) => g.id === genreId)) {
      setGenreId(modeGenres[0].id);
    }
  }, [modeGenres, genreId]);

  // Honour an external play request (Bobo recommendation): switch to the
  // track's genre, clear any active filter, and start playback.
  useEffect(() => {
    if (!mounted || !playRequest) return;
    const track = findTrack(playRequest);
    if (track && modeGenres.some((g) => g.id === track.genre)) {
      setQuery("");
      setShowFavourites(false);
      setGenreId(track.genre);
      if (track.verified && track.videoId) play(track, mode);
    }
    onPlayRequestHandled?.();
  }, [mounted, playRequest, modeGenres, mode, play, onPlayRequestHandled]);

  const toggleFavourite = useCallback((id: string) => {
    setFavourites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id];
      try {
        window.localStorage.setItem(FAVOURITES_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const tracks: Track[] = useMemo(() => {
    if (query.trim()) return searchTracks(query, tracksForMode(mode), 80);
    if (showFavourites) {
      const all = tracksForMode(mode);
      return all.filter((tr) => favourites.includes(tr.id));
    }
    return tracksForGenre(genreId);
  }, [query, showFavourites, favourites, genreId, mode]);

  const isFav = useCallback(
    (id: string) => favourites.includes(id),
    [favourites],
  );

  return (
    <div className="catalogue">
      <div className="catalogue-search">
        <input
          type="search"
          className="catalogue-search-input"
          placeholder={t("music.search")}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          tabIndex={open ? undefined : -1}
          aria-label={t("music.search")}
        />
        <button
          type="button"
          className={`catalogue-fav-toggle${showFavourites ? " is-active" : ""}`}
          aria-pressed={showFavourites}
          tabIndex={open ? undefined : -1}
          onClick={() => {
            setShowFavourites((v) => !v);
            setQuery("");
          }}
        >
          <span aria-hidden="true">★</span>
          <span>{t("music.favourites")}</span>
        </button>
      </div>

      {!query.trim() && !showFavourites && (
        <div className="catalogue-genres" role="group" aria-label={t("music.genres")}>
          {modeGenres.map((g) => {
            const selected = g.id === genreId;
            return (
              <button
                key={g.id}
                type="button"
                className={`catalogue-genre${selected ? " is-active" : ""}`}
                aria-pressed={selected}
                tabIndex={open ? undefined : -1}
                onClick={() => setGenreId(g.id)}
              >
                {t(g.labelKey)}
              </button>
            );
          })}
        </div>
      )}

      <ul className="catalogue-list">
        {!mounted ? null : tracks.length === 0 ? (
          <li className="catalogue-empty">{t("music.noResults")}</li>
        ) : (
          tracks.map((tr) => {
            const selected =
              current?.id === tr.id && origin === mode && current?.videoId != null;
            const playing = selected && status === "playing";
            return (
              <li
                key={tr.id}
                className={`catalogue-item${selected ? " is-current" : ""}`}
              >
                <div className="catalogue-track-row">
                  <button
                    type="button"
                    className="catalogue-track"
                    tabIndex={open ? undefined : -1}
                    onClick={() => {
                      if (selected && status !== "ended" && status !== "error") {
                        toggle();
                      } else {
                        play(tr, mode);
                      }
                    }}
                    aria-pressed={playing}
                    aria-label={`${playing ? t("music.pause") : t("music.play")} ${tr.title}`}
                  >
                    <span className="catalogue-track-play" aria-hidden="true">
                      {playing ? "❚❚" : "▶"}
                    </span>
                    <span className="catalogue-track-text">
                      <span className="catalogue-track-title">{tr.title}</span>
                      {tr.artist && (
                        <span className="catalogue-track-artist">{tr.artist}</span>
                      )}
                    </span>
                    {!tr.verified && (
                      <span className="catalogue-track-flag" aria-hidden="true">
                        !
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    className={`catalogue-fav${isFav(tr.id) ? " is-active" : ""}`}
                    aria-pressed={isFav(tr.id)}
                    aria-label={t("music.favourite")}
                    tabIndex={open ? undefined : -1}
                    onClick={() => toggleFavourite(tr.id)}
                  >
                    <span aria-hidden="true">★</span>
                  </button>
                </div>
                {selected && mode === "cheer" && <AudioPlayer />}
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export { GENRES };
