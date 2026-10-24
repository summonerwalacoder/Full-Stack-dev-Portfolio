"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { useMusic } from "./MusicProvider";

/**
 * Compact shared audio player. Only the audio is consumed; the underlying
 * YouTube frame stays mounted (ToS) but out of the way in the provider host.
 *
 * Every control here maps to a real playback capability. When a track could not
 * be resolved to an embeddable video we surface an honest "unavailable" state
 * (with a watch link on YouTube) instead of pretending it plays.
 */
export function AudioPlayer() {
  const { t } = useI18n();
  const {
    current,
    status,
    progress,
    position,
    duration,
    volume,
    muted,
    toggle,
    seek,
    seekBy,
    setVolume,
    toggleMute,
  } = useMusic();

  if (!current) return null;

  const isPlaying = status === "playing";
  const unavailable = status === "error";
  const loading = status === "loading" || status === "buffering";

  const fmt = (s: number) => {
    if (!Number.isFinite(s) || s < 0) return "0:00";
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="audio-player" role="group" aria-label={t("music.player")}>
      <div className="audio-player-row">
        <div className="audio-art" aria-hidden="true">
          <span>♪</span>
        </div>

        <div className="audio-meta">
          <p className="audio-title" title={current.title}>
            {current.title}
          </p>
          {current.artist && (
            <p className="audio-artist" title={current.artist}>
              {current.artist}
            </p>
          )}
        </div>

        <button
          type="button"
          className="audio-play"
          onClick={toggle}
          disabled={unavailable}
          aria-label={isPlaying ? t("music.pause") : t("music.play")}
        >
          <span aria-hidden="true">{isPlaying ? "❚❚" : "▶"}</span>
        </button>
      </div>

      {unavailable ? (
        <p className="audio-unavailable" role="status">
          {t("music.unavailable")}
        </p>
      ) : (
        <div className="audio-timeline">
          <span className="audio-time">{fmt(position)}</span>
          <button
            type="button"
            className="audio-skip"
            onClick={() => seekBy(-10)}
            disabled={duration <= 0 || loading}
            aria-label={t("music.seekBackward")}
            title={t("music.seekBackward")}
          >
            −10
          </button>
          <input
            type="range"
            className="audio-seek"
            min={0}
            max={1000}
            value={Math.round(progress * 1000)}
            onChange={(e) => seek(Number(e.target.value) / 1000)}
            aria-label={t("music.seek")}
            disabled={loading}
          />
          <button
            type="button"
            className="audio-skip"
            onClick={() => seekBy(10)}
            disabled={duration <= 0 || loading}
            aria-label={t("music.seekForward")}
            title={t("music.seekForward")}
          >
            +10
          </button>
          <span className="audio-time">
            {duration > 0 ? fmt(duration) : loading ? "…" : "—"}
          </span>
        </div>
      )}

      <div className="audio-volume">
        <button
          type="button"
          className="audio-mute"
          onClick={toggleMute}
          aria-label={muted ? t("music.unmute") : t("music.mute")}
        >
          <span aria-hidden="true">{muted ? "⊘" : "◉"}</span>
        </button>
        <input
          type="range"
          className="audio-volume-range"
          min={0}
          max={100}
          value={muted ? 0 : volume}
          onChange={(e) => setVolume(Number(e.target.value))}
          aria-label={t("music.volume")}
        />
      </div>
    </div>
  );
}
