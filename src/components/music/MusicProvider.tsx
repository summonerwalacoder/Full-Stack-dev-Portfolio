"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { loadYouTubeApi, type YTPlayer } from "@/lib/youtube/youtubeApi";
import { audioBus } from "@/lib/audio/audioBus";
import { tracksForGenre } from "@/data/music";
import type { Track } from "@/data/musicTypes";

/**
 * One shared YouTube player for the whole app so Cheer Mode and Fire Mode can
 * never play audio at the same time. Only the audio is wanted; the player is
 * kept visually minimal (YouTube ToS requires it to remain rendered).
 *
 * Playback begins only after an explicit user action (play/toggle). Nothing
 * autoplays on load.
 */

export type PlaybackStatus =
  | "idle"
  | "loading"
  | "buffering"
  | "playing"
  | "paused"
  | "ended"
  | "error";

export interface MusicState {
  current: Track | null;
  status: PlaybackStatus;
  /** 0..1 */
  progress: number;
  /** seconds */
  position: number;
  /** seconds, 0 when unknown */
  duration: number;
  /** 0..100 */
  volume: number;
  muted: boolean;
  /** Human error message when status === "error". */
  error: string | null;
  /** Which mode initiated the current playback. */
  origin: "cheer" | "fire" | null;
}

export interface MusicApi extends MusicState {
  /** Select and start playing a track. */
  play: (track: Track, origin?: "cheer" | "fire") => void;
  toggle: () => void;
  /** Pause (keeps the selection). */
  pause: () => void;
  /** Stop and clear the selection. */
  stop: () => void;
  seek: (fraction: number) => void;
  seekBy: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  /** Element id where the shared player must be mounted. */
  hostId: string;
}

const MusicContext = createContext<MusicApi | null>(null);

export const MUSIC_HOST_ID = "portfolio-shared-audio-player";

const DEFAULT_VOLUME = 80;
const SOUND_DUCKED_VOLUME = 24;
const VOLUME_KEY = "sumit.music.volume";
let warnedMissingVolumeMethod = false;

function effectiveVolume(volume: number, muted: boolean, soundActive: boolean) {
  if (muted) return 0;
  return soundActive ? Math.min(volume, SOUND_DUCKED_VOLUME) : volume;
}

function applyPlayerVolume(
  player: YTPlayer | null,
  volume: number,
  muted: boolean,
  soundActive: boolean,
) {
  if (!player) return;
  if (typeof player.setVolume !== "function") {
    if (!warnedMissingVolumeMethod) {
      warnedMissingVolumeMethod = true;
      console.error(
        "The YouTube player is ready but does not expose setVolume; sound ducking is unavailable.",
      );
    }
    return;
  }
  player.setVolume(effectiveVolume(volume, muted, soundActive));
}

function readStoredVolume(): number {
  try {
    const raw = window.localStorage.getItem(VOLUME_KEY);
    if (raw == null) return DEFAULT_VOLUME;
    const n = Number(raw);
    if (!Number.isFinite(n)) return DEFAULT_VOLUME;
    return Math.min(100, Math.max(0, Math.round(n)));
  } catch {
    return DEFAULT_VOLUME;
  }
}

export function MusicProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MusicState>({
    current: null,
    status: "idle",
    progress: 0,
    position: 0,
    duration: 0,
    volume: DEFAULT_VOLUME,
    muted: false,
    error: null,
    origin: null,
  });

  const stateRef = useRef(state);
  stateRef.current = state;
  const playerRef = useRef<YTPlayer | null>(null);
  const readyRef = useRef(false);
  const creatingRef = useRef(false);
  const pendingRef = useRef<Track | null>(null);
  const pendingPlayRef = useRef(true);
  const tickRef = useRef<number | null>(null);
  const volumeRef = useRef(DEFAULT_VOLUME);

  // restore stored volume on mount
  useEffect(() => {
    const v = readStoredVolume();
    volumeRef.current = v;
    setState((s) => ({ ...s, volume: v }));
  }, []);

  const stopTicker = useCallback(() => {
    if (tickRef.current != null) {
      window.clearInterval(tickRef.current);
      tickRef.current = null;
    }
  }, []);

  const startTicker = useCallback(() => {
    stopTicker();
    tickRef.current = window.setInterval(() => {
      const p = playerRef.current;
      if (!p) return;
      try {
        const position = p.getCurrentTime?.() ?? 0;
        const duration = p.getDuration?.() ?? 0;
        setState((s) => ({
          ...s,
          position,
          duration,
          progress: duration > 0 ? Math.min(1, position / duration) : 0,
        }));
      } catch {
        /* player not ready */
      }
    }, 500);
  }, [stopTicker]);

  const createPlayer = useCallback(async () => {
      if (playerRef.current || creatingRef.current) return;
      creatingRef.current = true;
      try {
        const api = await loadYouTubeApi();
        const host = document.getElementById(MUSIC_HOST_ID);
        if (!host) throw new Error("Shared music player host is unavailable.");

        const startNow = () => {
          playerRef.current = new api.Player(host, {
            width: "100%",
            height: "100%",
            playerVars: {
              controls: 0,
              disablekb: 1,
              modestbranding: 1,
              rel: 0,
              playsinline: 1,
              iv_load_policy: 3,
            },
            events: {
              onReady: (e) => {
                readyRef.current = true;
                creatingRef.current = false;
                try {
                  applyPlayerVolume(
                    e.target,
                    volumeRef.current,
                    stateRef.current.muted,
                    audioBus.isSoundActive(),
                  );
                } catch (error) {
                  console.error("Unable to set the music player volume.", error);
                }
                const pending = pendingRef.current;
                pendingRef.current = null;
                if (pending && pending.videoId) {
                  try {
                    if (audioBus.isSpeaking()) {
                      pendingPlayRef.current = false;
                      e.target.cueVideoById(pending.videoId);
                      setState((s) => ({ ...s, status: "paused" }));
                    } else if (pendingPlayRef.current) {
                      e.target.loadVideoById(pending.videoId);
                    } else {
                      e.target.cueVideoById(pending.videoId);
                    }
                  } catch {
                    /* ignore */
                  }
                }
              },
              onStateChange: (e) => {
                const S = api.PlayerState;
                if (e.data === S.PLAYING) {
                  if (audioBus.isSpeaking()) {
                    e.target.pauseVideo();
                    setState((s) => ({ ...s, status: "paused" }));
                    stopTicker();
                    return;
                  }
                  setState((s) => ({ ...s, status: "playing", error: null }));
                  startTicker();
                } else if (e.data === S.PAUSED) {
                  setState((s) => ({ ...s, status: "paused" }));
                  stopTicker();
                } else if (e.data === S.BUFFERING) {
                  setState((s) => ({ ...s, status: "buffering" }));
                } else if (e.data === S.ENDED) {
                  const current = stateRef.current;
                  if (current.origin === "cheer" && current.current) {
                    const playlist = tracksForGenre(current.current.genre);
                    const currentIndex = playlist.findIndex(
                      (track) => track.id === current.current?.id,
                    );
                    let nextTrack: Track | undefined;
                    for (
                      let offset = 1;
                      currentIndex >= 0 && offset < playlist.length;
                      offset += 1
                    ) {
                      const candidate =
                        playlist[(currentIndex + offset) % playlist.length];
                      if (candidate.verified && candidate.videoId) {
                        nextTrack = candidate;
                        break;
                      }
                    }

                    if (nextTrack?.videoId) {
                      const shouldPlay = !audioBus.isSpeaking();
                      pendingPlayRef.current = shouldPlay;
                      setState((s) => ({
                        ...s,
                        current: nextTrack,
                        status: shouldPlay ? "loading" : "paused",
                        progress: 0,
                        position: 0,
                        duration: 0,
                        error: null,
                      }));
                      stopTicker();
                      try {
                        if (shouldPlay) e.target.loadVideoById(nextTrack.videoId);
                        else e.target.cueVideoById(nextTrack.videoId);
                      } catch (error) {
                        console.error(
                          "Unable to advance to the next Cheer Mode track.",
                          error,
                        );
                        pendingPlayRef.current = false;
                        setState((s) => ({
                          ...s,
                          status: "error",
                          error: "unavailable",
                        }));
                      }
                      return;
                    }
                  }
                  setState((s) => ({
                    ...s,
                    status: "ended",
                    progress: 1,
                  }));
                  stopTicker();
                }
              },
              onError: () => {
                setState((s) => ({
                  ...s,
                  status: "error",
                  error: "unavailable",
                }));
                stopTicker();
              },
            },
          });
        };

        startNow();
      } catch (error) {
        creatingRef.current = false;
        console.error("Unable to initialize the shared music player.", error);
        setState((s) => ({ ...s, status: "error", error: "unavailable" }));
      }
  }, [startTicker, stopTicker]);

  const play = useCallback(
    (track: Track, origin?: "cheer" | "fire") => {
      // A user action supersedes any pending speech-resume.
      audioBus.noteUserMusicIntent();
      if (audioBus.isSpeaking()) {
        pendingPlayRef.current = false;
        pendingRef.current = null;
        setState((s) => ({
          ...s,
          current: track,
          status: track.videoId && track.verified ? "paused" : "error",
          progress: 0,
          position: 0,
          duration: 0,
          error: track.videoId && track.verified ? null : "unavailable",
          origin: origin ?? s.origin,
        }));
        return;
      }
      if (!track.videoId || !track.verified) {
        setState((s) => ({
          ...s,
          current: track,
          status: "error",
          error: "unavailable",
          origin: origin ?? s.origin,
        }));
        return;
      }

      setState((s) => ({
        ...s,
        current: track,
        status: "loading",
        progress: 0,
        position: 0,
        duration: 0,
        error: null,
        origin: origin ?? s.origin,
      }));
      pendingPlayRef.current = true;

      const p = playerRef.current;
      if (p && readyRef.current) {
        try {
          p.loadVideoById(track.videoId);
          p.playVideo();
        } catch {
          /* ignore */
        }
      } else {
        pendingRef.current = track;
        if (!p) {
          void createPlayer();
        }
      }
    },
    [createPlayer],
  );

  const toggle = useCallback(() => {
    audioBus.noteUserMusicIntent();
    const p = playerRef.current;
    if (!p) {
      if (state.status === "loading" || state.status === "buffering") {
        pendingPlayRef.current = false;
        setState((s) => ({ ...s, status: "paused" }));
      }
      return;
    }
    try {
      if (audioBus.isSpeaking()) {
        p.pauseVideo();
        setState((s) => ({ ...s, status: "paused" }));
        return;
      }
      if (state.status === "loading" || state.status === "buffering") {
        pendingPlayRef.current = false;
        p.cueVideoById(state.current?.videoId ?? "");
        setState((s) => ({ ...s, status: "paused" }));
        stopTicker();
        return;
      }
      const ps = p.getPlayerState?.();
      if (ps === 1) {
        p.pauseVideo();
      } else {
        pendingPlayRef.current = true;
        p.playVideo();
      }
    } catch {
      /* ignore */
    }
  }, [state.current, state.status, stopTicker]);

  const pause = useCallback(() => {
    audioBus.noteUserMusicIntent();
    if (state.status === "loading" || state.status === "buffering") {
      pendingPlayRef.current = false;
      setState((s) => ({ ...s, status: "paused" }));
    }
    try {
      playerRef.current?.pauseVideo();
    } catch {
      /* ignore */
    }
  }, [state.status]);

  const stop = useCallback(() => {
    audioBus.noteUserMusicIntent();
    pendingPlayRef.current = false;
    pendingRef.current = null;
    try {
      playerRef.current?.stopVideo();
    } catch {
      /* ignore */
    }
    stopTicker();
    setState((s) => ({
      ...s,
      current: null,
      status: "idle",
      progress: 0,
      position: 0,
      duration: 0,
      error: null,
    }));
  }, [stopTicker]);

  const seek = useCallback((fraction: number) => {
    const p = playerRef.current;
    if (!p) return;
    try {
      const duration = p.getDuration?.() ?? 0;
      if (duration > 0) {
        p.seekTo(Math.min(1, Math.max(0, fraction)) * duration, true);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const seekBy = useCallback((seconds: number) => {
    const p = playerRef.current;
    if (!p || !Number.isFinite(seconds)) return;
    try {
      const duration = p.getDuration?.() ?? 0;
      if (duration <= 0) return;
      const position = p.getCurrentTime?.() ?? 0;
      p.seekTo(Math.min(duration, Math.max(0, position + seconds)), true);
    } catch {
      /* player not ready */
    }
  }, []);

  const setVolume = useCallback((volume: number) => {
    const v = Math.min(100, Math.max(0, Math.round(volume)));
    volumeRef.current = v;
    try {
      window.localStorage.setItem(VOLUME_KEY, String(v));
    } catch {
      /* ignore */
    }
    try {
      if (readyRef.current) {
        applyPlayerVolume(
          playerRef.current,
          v,
          false,
          audioBus.isSoundActive(),
        );
      }
      if (v > 0) playerRef.current?.unMute();
    } catch {
      /* ignore */
    }
    setState((s) => ({ ...s, volume: v, muted: v === 0 }));
  }, []);

  const toggleMute = useCallback(() => {
    const p = playerRef.current;
    setState((s) => {
      const nextMuted = !s.muted;
      try {
        if (p) {
          if (nextMuted) p.mute();
          else {
            p.unMute();
            if (readyRef.current) {
              applyPlayerVolume(
                p,
                volumeRef.current || DEFAULT_VOLUME,
                false,
                audioBus.isSoundActive(),
              );
            }
          }
        }
      } catch {
        /* ignore */
      }
      return { ...s, muted: nextMuted };
    });
  }, []);

  // Keep the user's chosen volume while lowering music for other sound effects
  // and spoken narration.
  useEffect(() => {
    return audioBus.subscribeSoundActivity((active) => {
      if (!readyRef.current) return;
      try {
        applyPlayerVolume(
          playerRef.current,
          volumeRef.current,
          stateRef.current.muted,
          active,
        );
      } catch (error) {
        console.error("Unable to adjust music volume for another sound.", error);
      }
    });
  }, []);

  // cleanup on unmount
  useEffect(() => {
    return () => {
      stopTicker();
      try {
        playerRef.current?.destroy();
      } catch {
        /* ignore */
      }
      playerRef.current = null;
    };
  }, [stopTicker]);

  const api = useMemo<MusicApi>(
    () => ({
      ...state,
      play,
      toggle,
      pause,
      stop,
      seek,
      seekBy,
      setVolume,
      toggleMute,
      hostId: MUSIC_HOST_ID,
    }),
    [state, play, toggle, pause, stop, seek, seekBy, setVolume, toggleMute],
  );

  return (
    <MusicContext.Provider value={api}>
      {children}
      {/* The shared YouTube player mounts here, kept small/minimal. */}
      <div className="music-player-host" aria-hidden="true">
        <div id={MUSIC_HOST_ID} />
      </div>
    </MusicContext.Provider>
  );
}

export function useMusic(): MusicApi {
  const ctx = useContext(MusicContext);
  if (!ctx) throw new Error("useMusic must be used within a MusicProvider");
  return ctx;
}
