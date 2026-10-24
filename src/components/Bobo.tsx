"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { BoboCharacter, type BoboMode } from "./bobo/BoboCharacter";
import { usePerimeterWalk } from "./bobo/usePerimeterWalk";
import { cancelSpeech, playBoop, speakJoke } from "./bobo/boboAudio";

const JOKES = 12;

const REC_LANG: Record<string, string> = {
  en: "en-US",
  hi: "hi-IN",
  es: "es-ES",
  fr: "fr-FR",
  ja: "ja-JP",
  de: "de-DE",
  bn: "bn-IN",
  te: "te-IN",
  mr: "mr-IN",
  ta: "ta-IN",
  ur: "ur-PK",
  gu: "gu-IN",
  kn: "kn-IN",
  ml: "ml-IN",
  or: "or-IN",
  pa: "pa-IN",
  as: "as-IN",
  ne: "ne-NP",
  sd: "sd-PK",
};

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult:
    | ((e: {
        results: ArrayLike<ArrayLike<{ transcript: string }> & { isFinal: boolean }>;
      }) => void)
    | null;
  onend: (() => void) | null;
  onerror: ((e: { error?: string }) => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

function getRecognition(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

export function Bobo() {
  const { t, locale } = useI18n();
  const reduced = useReducedMotion();

  const [dismissed, setDismissed] = useState(false);
  const [bubble, setBubble] = useState<{ text: string; joke: boolean } | null>(
    null
  );
  const [bubblePos, setBubblePos] = useState({ x: 0, y: 0 });
  const [mode, setMode] = useState<BoboMode>("walk");
  const [mouth, setMouth] = useState(0.12);
  const [pupil, setPupil] = useState({ x: 0, y: 0 });
  const [sfxOn, setSfxOn] = useState(true);
  const [voiceOn, setVoiceOn] = useState(true);
  const [listening, setListening] = useState(false);
  const [intro, setIntro] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const speakingRef = useRef(false);
  const seqRef = useRef(0);
  const lastJoke = useRef(0);
  const lastClick = useRef(0);
  const voiceOnRef = useRef(true);
  const recRef = useRef<SpeechRecognitionLike | null>(null);
  const recWanted = useRef(false);
  const modeTimer = useRef(0);
  const celebratedRef = useRef(false);
  const introSpeechRef = useRef<(() => void) | null>(null);

  const [size, setSize] = useState(60);
  useEffect(() => {
    const fit = () => {
      const w = window.innerWidth;
      setSize(w < 640 ? 42 : w < 1024 ? 52 : 60);
    };
    fit();
    window.addEventListener("resize", fit, { passive: true });
    return () => window.removeEventListener("resize", fit);
  }, []);
  const sizeH = size * 1.3;

  const { pos, setPaused } = usePerimeterWalk(
    wrapRef,
    !dismissed,
    size,
    sizeH,
    Boolean(reduced)
  );

  useEffect(() => {
    voiceOnRef.current = voiceOn;
  }, [voiceOn]);

  useEffect(() => {
    try {
      setSfxOn(localStorage.getItem("sumit.bot.sfx") !== "0");
      setVoiceOn(localStorage.getItem("sumit.bot.voice") !== "0");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!intro) return;
    const timer = window.setTimeout(() => setIntro(false), 9000);
    return () => window.clearTimeout(timer);
  }, [intro]);

  const setModeFor = useCallback((m: BoboMode, ms?: number) => {
    window.clearTimeout(modeTimer.current);
    setMode(m);
    if (ms) {
      modeTimer.current = window.setTimeout(() => setMode("walk"), ms);
    }
  }, []);

  const stopListening = useCallback(() => {
    recWanted.current = false;
    setListening(false);
    try {
      recRef.current?.abort();
    } catch {
      /* ignore */
    }
  }, []);

  const resumeWalk = useCallback(() => {
    setPaused(false);
    if (recWanted.current) {
      try {
        recRef.current?.start();
      } catch {
        /* ignore */
      }
    }
  }, [setPaused]);

  const finishInteraction = useCallback(
    (seq: number) => {
      if (seq !== seqRef.current) return;
      speakingRef.current = false;
      setMouth(0.12);
      setBubble(null);
      setModeFor("laugh", 700);
      window.setTimeout(() => {
        if (seq !== seqRef.current) return;
        resumeWalk();
      }, 900);
    },
    [resumeWalk, setModeFor]
  );

  const autoClose = useCallback(
    (seq: number, ms: number) => {
      window.setTimeout(() => {
        if (seq !== seqRef.current || speakingRef.current) return;
        finishInteraction(seq);
      }, ms);
    },
    [finishInteraction]
  );

  const closeInteraction = useCallback(() => {
    seqRef.current += 1;
    cancelSpeech();
    speakingRef.current = false;
    setMouth(0.12);
    setBubble(null);
    setIntro(false);
    setModeFor("walk");
    resumeWalk();
  }, [resumeWalk, setModeFor]);

  const showBubble = useCallback(
    (text: string, joke: boolean, speak: boolean) => {
      cancelSpeech();
      const seq = ++seqRef.current;
      speakingRef.current = false;
      setIntro(false);
      setPaused(true);
      setBubblePos({ x: pos.current.x, y: pos.current.y });
      setBubble({ text, joke });
      setModeFor("talk");
      if (joke && sfxOn) playBoop();
      stopListening();
      if (!speak) {
        autoClose(seq, 4500);
        return;
      }
      const ok = speakJoke(text, locale, {
        onStart: () => {
          if (seq !== seqRef.current) return;
          speakingRef.current = true;
        },
        onEnd: () => finishInteraction(seq),
      });
      if (!ok) {
        setBubble({
          text: voiceOnRef.current ? `${text}\n\n${t("bot.noVoice")}` : text,
          joke,
        });
        autoClose(seq, 5000);
      }
    },
    [
      autoClose,
      finishInteraction,
      locale,
      pos,
      setModeFor,
      setPaused,
      sfxOn,
      stopListening,
      t,
    ]
  );

  introSpeechRef.current = () => {
    setIntro(true);
    showBubble(t("bot.intro"), false, voiceOnRef.current);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        if (sessionStorage.getItem("sumit.bobo.seen")) return;
        sessionStorage.setItem("sumit.bobo.seen", "1");
      } catch {
        /* ignore */
      }
      introSpeechRef.current?.();
    }, 6000);
    return () => window.clearTimeout(timer);
  }, []);

  const onActivate = useCallback(() => {
    const now = Date.now();
    if (now - lastClick.current < 500) return;
    lastClick.current = now;
    let next = Math.floor(Math.random() * JOKES) + 1;
    while (JOKES > 1 && next === lastJoke.current) {
      next = Math.floor(Math.random() * JOKES) + 1;
    }
    lastJoke.current = next;
    showBubble(t(`bot.joke${next}`), true, voiceOnRef.current);
  }, [showBubble, t]);

  const replyWith = useCallback(
    (key: string) => {
      showBubble(t(key), false, voiceOnRef.current);
    },
    [showBubble, t]
  );

  useEffect(() => {
    if (!bubble && !intro) return;
    const onDown = (e: PointerEvent) => {
      if ((e.target as Element).closest("[data-bobo-ui]")) return;
      closeInteraction();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeInteraction();
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [bubble, intro, closeInteraction]);

  const startRecognition = useCallback(() => {
    const Rec = getRecognition();
    if (!Rec) {
      showBubble(t("bot.micUnsupported"), false, false);
      return;
    }
    try {
      recWanted.current = true;
      const rec = new Rec();
      rec.lang = REC_LANG[locale.split("-")[0]] ?? "en-US";
      rec.continuous = true;
      rec.interimResults = false;
      rec.onresult = (e) => {
        const transcript = Array.from({ length: e.results.length }, (_, i) =>
          e.results[i]?.[0]?.transcript ?? ""
        )
          .join(" ")
          .toLowerCase()
          .replace(/[.,!?¿¡]/g, " ")
          .trim();
        if (!transcript || speakingRef.current) return;
        if (/\b(hey\s+bobo|hello\s+bobo|^bobo$|bobo)\b/.test(transcript)) {
          replyWith("bot.greeting");
          return;
        }
        if (/(tell me a joke|another joke|one more joke|joke)/.test(transcript)) {
          onActivate();
          return;
        }
        if (/(who are you|what.*your name)/.test(transcript)) {
          replyWith("bot.replyWho");
          return;
        }
        if (/(what can you do|help me|your job)/.test(transcript)) {
          replyWith("bot.replyWhat");
          return;
        }
        if (/repeat/.test(transcript)) {
          const last = lastJoke.current;
          if (last) showBubble(t(`bot.joke${last}`), true, voiceOnRef.current);
          return;
        }
        if (/(stop talking|be quiet|quiet|shut up)/.test(transcript)) {
          closeInteraction();
          return;
        }
        if (/(go to sleep|sleep|good night)/.test(transcript)) {
          stopListening();
          seqRef.current += 1;
          cancelSpeech();
          speakingRef.current = false;
          setModeFor("sleep");
          setBubble({ text: t("bot.replySleep"), joke: false });
          setBubblePos({ x: pos.current.x, y: pos.current.y });
          setPaused(true);
          autoClose(seqRef.current, 5000);
          return;
        }
        if (/(mute yourself|muted|silence yourself)/.test(transcript)) {
          setVoiceOn(false);
          try {
            localStorage.setItem("sumit.bot.voice", "0");
          } catch {
            /* ignore */
          }
          replyWith("bot.voiceOff");
          return;
        }
        replyWith("bot.replyDunno");
      };
      rec.onend = () => {
        if (recWanted.current && !speakingRef.current) {
          window.setTimeout(() => {
            try {
              if (recWanted.current && !speakingRef.current) rec.start();
            } catch {
              /* ignore */
            }
          }, 300);
        } else {
          setListening(false);
        }
      };
      rec.onerror = (e) => {
        if (e.error === "not-allowed" || e.error === "service-not-allowed") {
          stopListening();
          showBubble(t("bot.micDenied"), false, false);
        }
      };
      recRef.current = rec;
      rec.start();
      setListening(true);
    } catch {
      stopListening();
      showBubble(t("bot.micUnsupported"), false, false);
    }
  }, [
    autoClose,
    closeInteraction,
    locale,
    onActivate,
    pos,
    replyWith,
    setModeFor,
    setPaused,
    showBubble,
    stopListening,
    t,
  ]);

  const toggleMic = useCallback(() => {
    if (listening) stopListening();
    else startRecognition();
  }, [listening, startRecognition, stopListening]);

  useEffect(() => {
    if (!voiceOn && listening) stopListening();
  }, [voiceOn, listening, stopListening]);

  useEffect(() => {
    return () => {
      cancelSpeech();
      recWanted.current = false;
      try {
        recRef.current?.abort();
      } catch {
        /* ignore */
      }
    };
  }, []);

  useEffect(() => {
    if (mode !== "talk") return;
    let raf = 0;
    let last = 0;
    const loop = (now: number) => {
      if (now - last > 90) {
        last = now;
        setMouth(0.25 + Math.random() * 0.85);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mode]);

  useEffect(() => {
    if (reduced) {
      setPupil({ x: 0, y: 0 });
      return;
    }
    const onMove = (e: PointerEvent) => {
      const el = wrapRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const dx = Math.max(
        -1,
        Math.min(1, (e.clientX - (r.left + r.width / 2)) / 220)
      );
      const dy = Math.max(
        -1,
        Math.min(1, (e.clientY - (r.top + r.height / 2)) / 220)
      );
      setPupil({ x: dx * 1.8, y: dy * 1.8 });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [reduced]);

  useEffect(() => {
    if (dismissed) return;
    const el = document.getElementById("projects");
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || celebratedRef.current) continue;
          if (bubble) continue;
          celebratedRef.current = true;
          setModeFor("wave", 1400);
          io.disconnect();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [dismissed, bubble, setModeFor]);

  useEffect(() => {
    if (dismissed) return;
    let buffer = "";
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable) {
        return;
      }
      if (e.key.length !== 1) return;
      buffer = (buffer + e.key.toLowerCase()).slice(-4);
      if (buffer === "bobo") {
        buffer = "";
        setModeFor("wave", 1400);
        showBubble(t("bot.easter"), false, voiceOnRef.current);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [dismissed, setModeFor, showBubble, t]);

  if (dismissed) {
    return (
      <button
        type="button"
        data-bobo-ui
        onClick={() => {
          setDismissed(false);
          setModeFor("wave", 1200);
        }}
        aria-label={t("bot.open")}
        className="fixed bottom-20 end-4 z-40 flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-ink-raised text-glacier transition-colors duration-300 hover:border-glacier/50 hover:text-frost-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
      >
        <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
          <rect
            x="4"
            y="7"
            width="16"
            height="12"
            rx="5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
          />
          <circle cx="9.5" cy="13" r="1.4" fill="currentColor" />
          <circle cx="14.5" cy="13" r="1.4" fill="currentColor" />
          <line
            x1="12"
            y1="3"
            x2="12"
            y2="7"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
        </svg>
      </button>
    );
  }

  const vw = typeof window !== "undefined" ? window.innerWidth : 1024;
  const bx = Math.max(10, Math.min(bubblePos.x - 130, vw - 280));
  const by = Math.max(10, bubblePos.y - sizeH - 14);

  return (
    <div
      ref={wrapRef}
      className="pointer-events-none fixed left-0 top-0 z-[55]"
      style={{ width: size, height: sizeH, willChange: "transform" }}
    >
      <div
        className={`bobo-stage${mode !== "walk" || reduced ? " bobo-paused" : ""}`}
      >
        {(bubble || intro) && (
          <div
            data-bobo-ui
            role="status"
            aria-live="polite"
            className="bobo-bubble pointer-events-auto absolute"
            style={{
              left: bx - (bubblePos.x - size / 2),
              top: by - (bubblePos.y - sizeH / 2),
              width: "min(17rem, calc(100vw - 2rem))",
            }}
          >
            <button
              type="button"
              onClick={closeInteraction}
              aria-label={t("bot.close")}
              className="absolute end-2 top-2 flex h-5 w-5 items-center justify-center text-frost-500 transition-colors duration-200 hover:text-frost-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
            >
              <svg viewBox="0 0 12 12" width="10" height="10" aria-hidden="true">
                <path
                  d="M2 2l8 8M10 2l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <p className="whitespace-pre-line pe-5 text-[13px] leading-relaxed text-frost-200">
              {intro && !bubble ? t("bot.intro") : bubble?.text}
            </p>
            {bubble?.joke && (
              <div className="mt-3 flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                    const next = !sfxOn;
                    setSfxOn(next);
                    try {
                      localStorage.setItem("sumit.bot.sfx", next ? "1" : "0");
                    } catch {
                      /* ignore */
                    }
                  }}
                  className="text-[11px] text-frost-500 transition-colors duration-200 hover:text-glacier focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
                >
                  {sfxOn ? t("bot.mute") : t("bot.unmute")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const next = !voiceOn;
                    setVoiceOn(next);
                    try {
                      localStorage.setItem(
                        "sumit.bot.voice",
                        next ? "1" : "0"
                      );
                    } catch {
                      /* ignore */
                    }
                    if (!next) {
                      cancelSpeech();
                      speakingRef.current = false;
                    }
                  }}
                  className="text-[11px] text-frost-500 transition-colors duration-200 hover:text-glacier focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
                >
                  {voiceOn ? t("bot.voiceOn") : t("bot.voiceOff")}
                </button>
              </div>
            )}
            <span
              aria-hidden="true"
              className="absolute -bottom-[5px] end-8 block h-2.5 w-2.5 rotate-45 border-b border-e border-white/10 bg-ink-raised"
            />
          </div>
        )}

        <div
          className={`bobo-controls pointer-events-auto absolute left-1/2 -translate-x-1/2 ${
            listening ? "bobo-listening-ring" : ""
          }`}
          style={{ top: -38 }}
        >
          {listening && <span className="bobo-listen-chip">{t("bot.listening")}</span>}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              data-bobo-ui
              onClick={toggleMic}
              aria-label={listening ? t("bot.micStop") : t("bot.mic")}
              aria-pressed={listening}
              className={`flex h-7 w-7 items-center justify-center rounded-full border transition-colors duration-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier ${
                listening
                  ? "border-glacier bg-glacier/20 text-frost-50"
                  : "border-white/15 bg-ink-raised/90 text-glacier hover:border-glacier/50"
              }`}
            >
              <svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">
                <rect
                  x="5.5"
                  y="1.5"
                  width="5"
                  height="8"
                  rx="2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                />
                <path
                  d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <button
              type="button"
              data-bobo-ui
              onClick={() => setDismissed(true)}
              aria-label={t("bot.close")}
              className="flex h-5 w-5 items-center justify-center rounded-full border border-white/15 bg-ink-raised/90 text-frost-500 transition-colors duration-200 hover:text-frost-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
            >
              <svg viewBox="0 0 12 12" width="8" height="8" aria-hidden="true">
                <path
                  d="M2 2l8 8M10 2l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="button"
          data-bobo-ui
          onClick={onActivate}
          aria-label={t("bot.label")}
          aria-expanded={Boolean(bubble)}
          className="bobo-hit pointer-events-auto absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glacier"
          style={{ width: size, height: sizeH }}
        >
          <BoboCharacter
            mode={mode}
            mouth={mouth}
            pupilX={pupil.x}
            pupilY={pupil.y}
            listening={listening}
          />
        </button>
      </div>
    </div>
  );
}
