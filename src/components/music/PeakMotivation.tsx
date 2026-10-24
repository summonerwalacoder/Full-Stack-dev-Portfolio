"use client";
import { subscribeToBoboSpeech } from "./audioCoordination";
import { useEffect, useRef, useState } from "react";
import "./PeakMotivation.css";

const TRACKS = Array.from({ length: 16 }, (_, i) => ({
  id: i + 1,
  title: `Peak Motivation ${i + 1}`,
  src: `/audio/peak-motivation/${i + 1}.mp3`,
}));

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${mins}:${String(secs).padStart(2, "0")}`;
}

export function PeakMotivation() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldAutoPlayRef = useRef(false);

  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState("");

  const track = TRACKS[index];

  // Sync the timeline and playback state with the audio element.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      setPosition(audio.currentTime || 0);
    };

    const updateDuration = () => {
      setDuration(
        Number.isFinite(audio.duration) && audio.duration > 0
          ? audio.duration
          : 0
      );
    };

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);

    const onEnded = () => {
      setPlaying(false);
      setPosition(0);

      if (index < TRACKS.length - 1) {
        shouldAutoPlayRef.current = true;
        setIndex((current) => current + 1);
      } else {
        shouldAutoPlayRef.current = false;
      }
    };

    const onError = () => {
      setPlaying(false);
      setError("Track load nahi hui. MP3 file aur path check karo.");
    };

    const onLoadedData = () => {
      updateDuration();
      setError("");
    };

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("durationchange", updateDuration);
    audio.addEventListener("loadeddata", onLoadedData);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("durationchange", updateDuration);
      audio.removeEventListener("loadeddata", onLoadedData);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [index]);

  // Load the selected track and autoplay after the previous track ends.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    audio.currentTime = 0;

    setPosition(0);
    setDuration(0);
    setError("");

    audio.load();

    if (shouldAutoPlayRef.current) {
      const playNext = async () => {
        try {
          await audio.play();
          shouldAutoPlayRef.current = false;
        } catch {
          shouldAutoPlayRef.current = false;
          setPlaying(false);
          setError("Next track play nahi ho paya. Play button dabao.");
        }
      };

      void playNext();
    }
  }, [index]);

  async function togglePlayback() {
    const audio = audioRef.current;
    if (!audio) return;

    if (!audio.paused) {
      shouldAutoPlayRef.current = false;
      audio.pause();
      return;
    }

    try {
      setError("");
      await audio.play();
    } catch {
      setPlaying(false);
      setError("Playback failed. MP3 file aur path check karo.");
    }
  }

  function changeTrack(nextIndex: number) {
    if (nextIndex < 0 || nextIndex >= TRACKS.length) return;

    shouldAutoPlayRef.current = false;
    audioRef.current?.pause();

    setPlaying(false);
    setIndex(nextIndex);
  }

  // Seek directly to the selected position on the timeline.
  function seek(value: number) {
    const audio = audioRef.current;

    if (
      !audio ||
      !Number.isFinite(audio.duration) ||
      audio.duration <= 0
    ) {
      return;
    }

    const nextPosition = Math.max(
      0,
      Math.min(value, audio.duration)
    );

    audio.currentTime = nextPosition;
    setPosition(nextPosition);
  }

  // Rewind or fast-forward by the requested number of seconds.
  function skipSeconds(seconds: number) {
    const audio = audioRef.current;

    if (
      !audio ||
      !Number.isFinite(audio.duration) ||
      audio.duration <= 0
    ) {
      return;
    }

    const nextPosition = Math.max(
      0,
      Math.min(audio.currentTime + seconds, audio.duration)
    );

    audio.currentTime = nextPosition;
    setPosition(nextPosition);
  }

  // Clicking the launcher again closes the panel and pauses playback.
  function togglePanel() {
    if (open) {
      shouldAutoPlayRef.current = false;
      audioRef.current?.pause();
      setPlaying(false);
      setOpen(false);
    } else {
      setOpen(true);
    }
  }

  function closePanel() {
    shouldAutoPlayRef.current = false;
    audioRef.current?.pause();
    setPlaying(false);
    setOpen(false);
  }

  return (
    <div className="peak-root">
      <audio
        ref={audioRef}
        src={track.src}
        preload="auto"
      />

      <button
        type="button"
        className={`peak-button${playing ? " is-playing" : ""}`}
        aria-expanded={open}
        aria-label="Toggle Peak Motivation player"
        onClick={togglePanel}
      >
        <span aria-hidden="true">▲</span>
        <span>Peak Motivation</span>
        {playing && (
          <span className="peak-live-dot" aria-label="Playing" />
        )}
      </button>

      {open && (
        <section
          className="peak-panel"
          aria-label="Peak Motivation player"
        >
          <div className="peak-panel-heading">
            <div>
              <p className="peak-eyebrow">FOCUS MODE</p>
              <h2>Peak Motivation</h2>
              <p className="peak-track-count">
                Track {index + 1} of {TRACKS.length}
              </p>
            </div>

            <button
              type="button"
              className="peak-close"
              onClick={closePanel}
              aria-label="Close player"
            >
              ×
            </button>
          </div>

          <p className="peak-track-title">{track.title}</p>

          <div className="peak-progress-row">
            <span>{formatTime(position)}</span>

            <input
              type="range"
              min={0}
              max={duration || 1}
              step={0.1}
              value={Math.min(position, duration || 1)}
              onChange={(event) =>
                seek(Number(event.target.value))
              }
              aria-label="Track progress"
              disabled={!duration}
            />

            <span>{formatTime(duration)}</span>
          </div>

          <div className="peak-controls">
            <button
              type="button"
              onClick={() => changeTrack(index - 1)}
              disabled={index === 0}
              aria-label="Previous track"
              title="Previous track"
            >
              |◀
            </button>

            <button
              type="button"
              onClick={() => skipSeconds(-4)}
              disabled={!duration}
              aria-label="Rewind 4 seconds"
              title="Rewind 4 seconds"
            >
              ↶
              <span className="peak-skip-label">4s</span>
            </button>

            <button
              type="button"
              className="peak-play"
              onClick={togglePlayback}
              aria-label={playing ? "Pause" : "Play"}
              title={playing ? "Pause" : "Play"}
            >
              {playing ? "Ⅱ" : "▶"}
            </button>

            <button
              type="button"
              onClick={() => skipSeconds(4)}
              disabled={!duration}
              aria-label="Forward 4 seconds"
              title="Forward 4 seconds"
            >
              ↷
              <span className="peak-skip-label">4s</span>
            </button>

            <button
              type="button"
              onClick={() => changeTrack(index + 1)}
              disabled={index === TRACKS.length - 1}
              aria-label="Next track"
              title="Next track"
            >
              ▶|
            </button>
          </div>

          {error && (
            <p className="peak-error" role="status">
              {error}
            </p>
          )}
        </section>
      )}
    </div>
  );
}