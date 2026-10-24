"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

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

export function FunnyThings() {
  const introVideoRef = useRef<HTMLVideoElement>(null);

const handleIntroEnter = () => {
  const video = introVideoRef.current;
  if (!video) return;

  video.muted = false;
  video.loop = true;
  video.play().catch((error) => {
    if (error.name !== "NotAllowedError") {
      console.error("Intro video playback failed:", error);
    }
  });
};

const handleIntroLeave = () => {
  introVideoRef.current?.pause();
};
  const [activeCategory, setActiveCategory] = useState<Category | "All">("All");
  const firstVideoRef = useRef<HTMLVideoElement>(null);
const secondVideoRef = useRef<HTMLVideoElement>(null);
  const visibleBits =
    activeCategory === "All"
      ? FUNNY_BITS
      : FUNNY_BITS.filter((bit) => bit.category === activeCategory);
const [isVideoSectionHovered, setIsVideoSectionHovered] = useState(false);
const videoSectionRef = useRef<HTMLElement>(null);

const handleSectionEnter = () => {
  setIsVideoSectionHovered(true);
};

const handleSectionLeave = () => {
  setIsVideoSectionHovered(false);
  firstVideoRef.current?.pause();
  secondVideoRef.current?.pause();
};

useEffect(() => {
  if (!isVideoSectionHovered) return;

  const first = firstVideoRef.current;
  const second = secondVideoRef.current;

  if (!first || !second) return;

  let isActive = true;

  first.loop = false;
  second.loop = false;

  first.currentTime = 0;
  second.currentTime = 0;

  const playFirst = async () => {
    if (!isActive) return;

    second.pause();
    second.currentTime = 0;

    try {
      await first.play();
    } catch (error) {
      console.error("First video playback failed:", error);
    }
  };

  const playSecond = async () => {
    if (!isActive) return;

    first.pause();
    first.currentTime = 0;

    try {
      await second.play();
    } catch (error) {
      console.error("Second video playback failed:", error);
    }
  };

  const handleFirstEnded = () => {
    void playSecond();
  };

  const handleSecondEnded = () => {
    void playFirst();
  };

  first.addEventListener("ended", handleFirstEnded);
  second.addEventListener("ended", handleSecondEnded);

  void playFirst();

  return () => {
    isActive = false;

    first.removeEventListener("ended", handleFirstEnded);
    second.removeEventListener("ended", handleSecondEnded);

    first.pause();
    second.pause();
  };
}, [isVideoSectionHovered]);
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
        
<section
  className="mt-8 w-full"
  aria-label="Funny Things intro video"
  onMouseEnter={handleIntroEnter}
  onMouseLeave={handleIntroLeave}
>
  <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-lg">
    <video
      ref={introVideoRef}
      className="block max-h-[75vh] w-full object-contain"
      src="/videos/hanuman chalisa.mp4"
      playsInline
      preload="auto"
      loop
    >
      Your browser does not support video playback.
    </video>
  </div>
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
<section
  ref={videoSectionRef}
  className="mt-16"
  aria-labelledby="funny-video-title"
  onMouseEnter={handleSectionEnter}
  onMouseLeave={handleSectionLeave}
>  <h2
    id="funny-video-title"
    className="mb-5 font-display text-2xl text-frost-50 md:text-3xl"
  >
    One Last Thing
  </h2>

  <div className="grid grid-cols-1 items-stretch gap-6 sm:grid-cols-[280px_minmax(0,1fr)]">
    {/* First video — Instagram Reel width */}
    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
      <div className="relative aspect-[9/16] w-full">
        <video
          ref={firstVideoRef}
          className="absolute inset-0 h-full w-full object-contain"
          controls
          playsInline
          preload="auto"
        >
          <source src="/videos/funny.mp4" type="video/mp4" />
          Your browser does not support video playback.
        </video>
      </div>
    </div>

    {/* Second video — remaining screen width, same height */}
    <div className="w-full min-w-0 overflow-hidden rounded-xl border border-white/10 bg-black shadow-lg">
      <div className="relative h-full min-h-0 w-full">
        <video
          ref={secondVideoRef}
          className="absolute inset-0 h-full w-full object-contain"
          controls
          playsInline
          preload="auto"
        >
          <source src="/videos/f2.mp4" type="video/mp4" />
          Your browser does not support video playback.
        </video>
      </div>
    </div>
  </div>
</section>

        <footer className="mt-14 border-t border-white/[0.09] pt-5 text-[12px] text-frost-500">
          <Link
            href="/"
            className="transition-colors hover:text-glacier"
          >
            ← Back to the portfolio
          </Link>
        </footer>
      </div>
    </main>
  );
}
