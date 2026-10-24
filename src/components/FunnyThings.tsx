
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";

const CATEGORIES = [
  "Programming Humor",
  "Developer Life",
  "Student Life",
  "Tech Jokes",
  "Random Funny Stuff",
] as const;

type Category = (typeof CATEGORIES)[number];

const FUNNY_BITS: { category: Category; title: string; text: string }[] = [
  {
    category: "Programming Humor",
    title: "The tiny change",
    text: "“I’ll just change one small thing.” — the opening line of a three-hour debugging session.",
  },
  {
    category: "Programming Humor",
    title: "Works on my machine",
    text: "A classic phrase meaning: the bug has successfully moved to someone else’s computer.",
  },
  {
    category: "Developer Life",
    title: "Quick question",
    text: "“Do you have a minute?” is how a five-minute conversation becomes a new feature request.",
  },
  {
    category: "Developer Life",
    title: "The perfect setup",
    text: "Spent an hour choosing a code theme. Wrote one line. Time for a break.",
  },
  {
    category: "Student Life",
    title: "Study plan",
    text: "Step one: make a color-coded study plan. Step two: admire it instead of studying.",
  },
  {
    category: "Student Life",
    title: "Deadline math",
    text: "“It’s due tomorrow” is not a date. It’s a sudden change in my personality.",
  },
  {
    category: "Tech Jokes",
    title: "Why did the function break up?",
    text: "It needed more space, so it returned.",
  },
  {
    category: "Tech Jokes",
    title: "A byte walks into a bar",
    text: "The bartender says, “Sorry, we don’t serve your type.”",
  },
  {
    category: "Random Funny Stuff",
    title: "The browser tabs",
    text: "I keep 37 tabs open so I can forget what I was looking for in several different places.",
  },
  {
    category: "Random Funny Stuff",
    title: "Productivity mode",
    text: "Opened my laptop to get things done. First, I had to check if the internet was still there.",
  },
];

const VIDEO_SOURCES = [
  "/videos/hanuman chalisa.mp4",
  "/videos/funny.mp4",
  "/videos/f2.mp4",
];

function VideoCard({
  src,
  label,
  className = "",
  aspectClass = "",
}: {
  src: string;
  label: string;
  className?: string;
  aspectClass?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hideButtonTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hoveredRef = useRef(false);

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [showControls, setShowControls] = useState(true);

  const clearButtonTimer = useCallback(() => {
    if (hideButtonTimer.current !== null) {
      clearTimeout(hideButtonTimer.current);
      hideButtonTimer.current = null;
    }
  }, []);

  const showControlsTemporarily = useCallback(() => {
    clearButtonTimer();
    setShowControls(true);

    hideButtonTimer.current = setTimeout(() => {
      setShowControls(false);
      hideButtonTimer.current = null;
    }, 10000);
  }, [clearButtonTimer]);

  const playVideo = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setPlaying(true);
      showControlsTemporarily();
    } catch (error) {
      setPlaying(false);
      setShowControls(true);
      console.error(`Could not play ${label}:`, error);
    }
  }, [label, showControlsTemporarily]);

  const pauseVideo = useCallback(() => {
    const video = videoRef.current;

    if (video && !video.paused) {
      video.pause();
    }

    setPlaying(false);
    setShowControls(true);
    clearButtonTimer();
  }, [clearButtonTimer]);

  const togglePlayback = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      void playVideo();
    } else {
      pauseVideo();
    }
  }, [pauseVideo, playVideo]);

  const handleMouseEnter = useCallback(() => {
    hoveredRef.current = true;
    void playVideo();
  }, [playVideo]);

  const handleMouseLeave = useCallback(() => {
    hoveredRef.current = false;
    pauseVideo();
  }, [pauseVideo]);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setMuted(video.muted);
    showControlsTemporarily();
  }, [showControlsTemporarily]);

  const changeVolume = useCallback(
    (change: number) => {
      const video = videoRef.current;
      if (!video) return;

      const nextVolume = Math.max(0, Math.min(1, video.volume + change));

      video.volume = nextVolume;
      setVolume(nextVolume);

      if (nextVolume > 0 && video.muted) {
        video.muted = false;
        setMuted(false);
      } else if (nextVolume === 0) {
        video.muted = true;
        setMuted(true);
      }

      showControlsTemporarily();
    },
    [showControlsTemporarily]
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => setPlaying(true);
    const handlePause = () => setPlaying(false);
    const handleEnded = () => {
      setPlaying(false);
      setShowControls(true);
      clearButtonTimer();
    };

    video.volume = volume;
    video.muted = muted;

    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
      video.removeEventListener("ended", handleEnded);
      clearButtonTimer();
    };
  }, [muted, volume, clearButtonTimer]);

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className={`relative w-full ${aspectClass}`}>
        <video
          ref={videoRef}
          className="absolute inset-0 h-full w-full object-contain"
          src={src}
          playsInline
          preload="metadata"
          onClick={togglePlayback}
        >
          Your browser does not support video playback.
        </video>

        <div
          className={`absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 transition-opacity duration-200 ${
            showControls
              ? "visible opacity-100"
              : "invisible pointer-events-none opacity-0"
          }`}
        >
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              togglePlayback();
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/75 text-white shadow-lg backdrop-blur-sm transition hover:bg-black active:scale-95"
            aria-label={playing ? `Pause ${label}` : `Play ${label}`}
            title={playing ? "Pause video" : "Play video"}
          >
            {playing ? "Ⅱ" : "▶"}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              toggleMute();
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/75 text-lg text-white shadow-lg backdrop-blur-sm transition hover:bg-black active:scale-95"
            aria-label={muted ? "Unmute video" : "Mute video"}
            title={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              changeVolume(0.1);
            }}
            disabled={volume >= 1}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/75 text-lg text-white shadow-lg backdrop-blur-sm transition hover:bg-black active:scale-95 disabled:opacity-40"
            aria-label="Volume up"
            title="Volume up"
          >
            +
          </button>
          <span className="min-w-[42px] text-center text-xs font-bold text-white">
  {Math.round(volume * 100)}%
</span>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              changeVolume(-0.1);
            }}
            disabled={volume <= 0}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/25 bg-black/75 text-lg text-white shadow-lg backdrop-blur-sm transition hover:bg-black active:scale-95 disabled:opacity-40"
            aria-label="Volume down"
            title="Volume down"
          >
            −
          </button>
        </div>
      </div>
    </div>
  );
}

export function FunnyThings() {
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");

  const visibleBits =
    activeCategory === "All"
      ? FUNNY_BITS
      : FUNNY_BITS.filter((bit) => bit.category === activeCategory);

  return (
    <main className="relative z-10 min-h-screen px-5 pb-16 pt-24 md:px-8 md:pt-28">
      <div className="mx-auto max-w-shell">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[13px] text-frost-300 transition-colors hover:text-glacier"
        >
          <span aria-hidden="true">←</span>
          Back to portfolio
        </Link>

        <section className="mt-8 w-full" aria-label="Funny Things intro video">
          <VideoCard
            src={VIDEO_SOURCES[0]}
            label="Intro video"
            className="rounded-2xl"
            aspectClass="max-h-[75vh] aspect-video"
          />
        </section>

        <header className="mt-12 max-w-2xl">
          <p className="text-[11px] uppercase tracking-label text-glacier/80">
            A little break from the bugs
          </p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,8vw,5rem)] font-light leading-tight tracking-[-0.02em] text-frost-50">
            Funny Things
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-frost-300">
            Programming mishaps, student-life moments, and small jokes for
            anyone who has ever tried turning it off and on again.
          </p>
        </header>

        <section className="mt-10" aria-label="Funny things by category">
          <div
            className="flex flex-wrap gap-2"
            role="group"
            aria-label="Filter funny things"
          >
            <button
              type="button"
              aria-pressed={activeCategory === "All"}
              onClick={() => setActiveCategory("All")}
              className={`rounded-full border px-3.5 py-2 text-[12px] transition-colors ${
                activeCategory === "All"
                  ? "border-glacier/50 bg-glacier/10 text-frost-50"
                  : "border-white/10 text-frost-400 hover:border-white/25 hover:text-frost-100"
              }`}
            >
              Everything
            </button>

            {CATEGORIES.map((category) => (
              <button
                key={category}
                type="button"
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full border px-3.5 py-2 text-[12px] transition-colors ${
                  activeCategory === category
                    ? "border-glacier/50 bg-glacier/10 text-frost-50"
                    : "border-white/10 text-frost-400 hover:border-white/25 hover:text-frost-100"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          <p className="mt-5 text-[11px] text-frost-500" aria-live="polite">
            {visibleBits.length} {visibleBits.length === 1 ? "bit" : "bits"} of
            fun
          </p>

          <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {visibleBits.map((bit) => (
              <li
                key={bit.title}
                className="rounded-lg border border-white/[0.1] bg-ink-raised/85 p-5 shadow-lg shadow-black/10 backdrop-blur-sm"
              >
                <p className="text-[10px] uppercase tracking-[0.16em] text-glacier/80">
                  {bit.category}
                </p>
                <h2 className="mt-3 font-display text-xl font-normal text-frost-100">
                  {bit.title}
                </h2>
                <p className="mt-2 text-[13px] leading-relaxed text-frost-300">
                  {bit.text}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-16" aria-labelledby="funny-video-title">
          <h2
            id="funny-video-title"
            className="mb-5 font-display text-2xl text-frost-50 md:text-3xl"
          >
            One Last Thing
          </h2>

          <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-[280px_minmax(0,1fr)]">
            <VideoCard
              src={VIDEO_SOURCES[1]}
              label="Funny video"
              aspectClass="aspect-[9/16]"
            />

            <VideoCard
              src={VIDEO_SOURCES[2]}
              label="Second funny video"
              aspectClass="h-full min-h-[320px]"
            />
          </div>
        </section>

        <footer className="mt-14 border-t border-white/[0.09] pt-5 text-[12px] text-frost-500">
          <Link href="/" className="transition-colors hover:text-glacier">
            ← Back to the portfolio
          </Link>
        </footer>
      </div>
    </main>
  );
}
