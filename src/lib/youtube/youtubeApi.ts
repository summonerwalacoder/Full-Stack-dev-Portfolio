/**
 * Minimal loader for the official YouTube IFrame Player API.
 *
 * The API script is injected once, lazily, the first time a player is created.
 * Loading it only on demand keeps the portfolio fast when music is never used.
 *
 * Docs: https://developers.google.com/youtube/iframe_api_reference
 */

export interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  stopVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  setVolume(volume: number): void;
  getVolume(): number;
  mute(): void;
  unMute(): void;
  isMuted(): boolean;
  getCurrentTime(): number;
  getDuration(): number;
  getPlayerState(): number;
  loadVideoById(videoId: string): void;
  cueVideoById(videoId: string): void;
  destroy(): void;
}

export interface YTPlayerEvent {
  target: YTPlayer;
  data: number;
}

export interface YTNamespace {
  Player: new (
    elementOrId: HTMLElement | string,
    options: {
      videoId?: string;
      width?: string | number;
      height?: string | number;
      playerVars?: Record<string, string | number>;
      events?: {
        onReady?: (e: { target: YTPlayer }) => void;
        onStateChange?: (e: YTPlayerEvent) => void;
        onError?: (e: YTPlayerEvent) => void;
      };
    },
  ) => YTPlayer;
  PlayerState: {
    UNSTARTED: -1;
    ENDED: 0;
    PLAYING: 1;
    PAUSED: 2;
    BUFFERING: 3;
    CUED: 5;
  };
}

declare global {
  interface Window {
    YT?: YTNamespace;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let loaderPromise: Promise<YTNamespace> | null = null;

export function loadYouTubeApi(): Promise<YTNamespace> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API requires a browser"));
  }
  if (window.YT && window.YT.Player) {
    return Promise.resolve(window.YT);
  }
  if (loaderPromise) return loaderPromise;

  loaderPromise = new Promise<YTNamespace>((resolve, reject) => {
    const existing = document.getElementById("yt-iframe-api");
    if (!existing) {
      const tag = document.createElement("script");
      tag.id = "yt-iframe-api";
      tag.src = "https://www.youtube.com/iframe_api";
      tag.async = true;
      tag.onerror = () => reject(new Error("Failed to load YouTube IFrame API"));
      document.head.appendChild(tag);
    }

    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      if (window.YT) resolve(window.YT);
      else reject(new Error("YouTube namespace missing after load"));
    };

    // Fallback poll in case the global callback was already consumed.
    const started = Date.now();
    const poll = window.setInterval(() => {
      if (window.YT && window.YT.Player) {
        window.clearInterval(poll);
        resolve(window.YT);
      } else if (Date.now() - started > 15000) {
        window.clearInterval(poll);
        reject(new Error("Timed out loading YouTube IFrame API"));
      }
    }, 200);
  });

  return loaderPromise;
}
