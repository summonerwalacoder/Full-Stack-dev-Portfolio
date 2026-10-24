"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import type { FireSet } from "@/data/fireMode";
import { audioBus } from "@/lib/audio/audioBus";
import { FlameGlyph } from "./FireGlyphs";

interface SpotifyPlaybackUpdate {
  data: { isPaused: boolean };
}

interface SpotifyEmbedController {
  pause: () => void;
  resume: () => void;
  destroy: () => void;
  addListener: (
    event: "playback_update",
    listener: (update: SpotifyPlaybackUpdate) => void,
  ) => void;
}

interface SpotifyIframeApi {
  createController: (
    element: HTMLElement,
    options: { uri: string; width: string; height: number },
    callback: (controller: SpotifyEmbedController) => void,
  ) => void;
}

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIframeApi) => void;
  }
}

let spotifyIframeApi: SpotifyIframeApi | null = null;
let spotifyIframeApiPromise: Promise<SpotifyIframeApi> | null = null;

function loadSpotifyIframeApi(): Promise<SpotifyIframeApi> {
  if (spotifyIframeApi) return Promise.resolve(spotifyIframeApi);
  if (spotifyIframeApiPromise) return spotifyIframeApiPromise;

  spotifyIframeApiPromise = new Promise<SpotifyIframeApi>((resolve, reject) => {
    let settled = false;
    const previousReady = window.onSpotifyIframeApiReady;
    const script =
      document.querySelector<HTMLScriptElement>(
        'script[data-spotify-iframe-api="true"]',
      ) ?? document.createElement("script");
    const fail = (error: Error) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      if (window.onSpotifyIframeApiReady === onReady) {
        window.onSpotifyIframeApiReady = previousReady;
      }
      reject(error);
    };
    const onReady = (api: SpotifyIframeApi) => {
      if (settled) return;
      settled = true;
      spotifyIframeApi = api;
      window.clearTimeout(timeout);
      resolve(api);
    };
    const timeout = window.setTimeout(
      () => fail(new Error("Spotify iframe API did not become ready.")),
      15000,
    );

    window.onSpotifyIframeApiReady = onReady;
    if (!script.src) {
      script.dataset.spotifyIframeApi = "true";
      script.src = "https://open.spotify.com/embed/iframe-api/v1";
      script.async = true;
      script.onerror = () => {
        script.remove();
        fail(new Error("Unable to load the Spotify iframe API."));
      };
      document.head.append(script);
    }
  }).catch((error: unknown) => {
    spotifyIframeApiPromise = null;
    throw error;
  });

  return spotifyIframeApiPromise;
}

export interface FirePlayerProps {
  set: FireSet | null;
  /** When false the player is moved off-screen but keeps its iframe alive. */
  open: boolean;
  /** When true the parent mode was suspended by the other music mode. */
  suspended: boolean;
}

export function FirePlayer({ set, open, suspended }: FirePlayerProps) {
  const { t } = useI18n();
  const [frameState, setFrameState] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const embedHostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyEmbedController | null>(null);
  const playingRef = useRef(false);
  const pausedForSpeechRef = useRef(false);

  useEffect(() => {
    setFrameState(set ? "loading" : "idle");
    playingRef.current = false;
    pausedForSpeechRef.current = false;
  }, [set]);

  useEffect(() => {
    if (!set || !embedHostRef.current) return;
    let disposed = false;
    const host = embedHostRef.current;
    const target = document.createElement("div");
    host.replaceChildren(target);

    void loadSpotifyIframeApi()
      .then((api) => {
        if (disposed) return;
        api.createController(
          target,
          {
            uri: `spotify:playlist:${set.playlistId}`,
            width: "100%",
            height: 220,
          },
          (controller) => {
            if (disposed) {
              controller.destroy();
              return;
            }
            controllerRef.current = controller;
            setFrameState("ready");
            controller.addListener("playback_update", ({ data }) => {
              if (disposed) return;
              playingRef.current = !data.isPaused;
              if (playingRef.current && audioBus.isSpeaking()) {
                audioBus.noteUserMusicIntent();
                controller.pause();
              }
            });
          },
        );
      })
      .catch((error: unknown) => {
        if (disposed) return;
        console.error("Unable to initialize the Fire Mode Spotify player.", error);
        setFrameState("error");
      });

    return () => {
      disposed = true;
      playingRef.current = false;
      pausedForSpeechRef.current = false;
      try {
        controllerRef.current?.destroy();
      } catch (error) {
        console.error("Unable to clean up the Fire Mode Spotify player.", error);
      }
      controllerRef.current = null;
    };
  }, [set]);

  useEffect(() => {
    const ducker = {
      isPlaying: () => playingRef.current,
      pause: () => {
        if (!playingRef.current) return false;
        playingRef.current = false;
        pausedForSpeechRef.current = true;
        try {
          controllerRef.current?.pause();
          return true;
        } catch (error) {
          console.error("Unable to pause Fire Mode for speech.", error);
          return false;
        }
      },
      resume: () => {
        if (!pausedForSpeechRef.current) return;
        pausedForSpeechRef.current = false;
        try {
          controllerRef.current?.resume();
        } catch (error) {
          console.error("Unable to resume Fire Mode after speech.", error);
        }
      },
    };
    return audioBus.registerDucker(ducker);
  }, []);

  // Pause when another music mode takes over.
  useEffect(() => {
    if (!suspended) return;
    audioBus.noteUserMusicIntent();
    playingRef.current = false;
    pausedForSpeechRef.current = false;
    try {
      controllerRef.current?.pause();
    } catch (error) {
      console.error("Unable to pause Fire Mode after switching music modes.", error);
    }
  }, [suspended]);

  if (!set) {
    return (
      <div className="fire-empty">
        <span className="fire-empty-glyph" aria-hidden="true">
          <FlameGlyph className="h-5 w-5" />
        </span>
        <p className="fire-empty-text">{t("fire.empty")}</p>
        <p className="fire-hint">{t("fire.emptyHint")}</p>
      </div>
    );
  }

  return (
    <div className={`fire-player${open ? "" : " is-background"}`}>
      <div className="fire-track">
        <div className="fire-art" aria-hidden="true">
          <FlameGlyph className="h-6 w-6" />
        </div>
        <div className="fire-track-text">
          <p className="fire-track-title">{t(set.labelKey)}</p>
          <p className="fire-track-artist">{t(set.descriptionKey)}</p>
        </div>
      </div>

      <div className="fire-frame-wrap">
        {frameState === "loading" && (
          <p className="fire-frame-loading">{t("fire.loading")}</p>
        )}
        <div ref={embedHostRef} className="fire-frame" />
        {frameState === "error" && (
          <p className="fire-frame-loading" role="status">
            {t("music.status.unavailable")}
          </p>
        )}
      </div>
    </div>
  );
}
