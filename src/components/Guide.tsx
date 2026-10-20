"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { GuideCharacter } from "./GuideCharacter";

type Panel = "full" | "mini" | "hidden";
type Status = "idle" | "playing" | "paused" | "done";

const SEEN_KEY = "sumit.guide.seen";
const MUTED_KEY = "sumit.guide.muted";

function splitSentences(text: string): string[] {
  const parts = text.match(/[^.!?।।!?。！？]+[.!?।。！？]*[\s]*/g);
  return (parts ?? [text]).map((s) => s.trim()).filter(Boolean);
}

function Icon({ d, filled = false }: { d: string; filled?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

const ICONS = {
  play: "M4.5 3.2v9.6L12.5 8z",
  pause: "M5.5 3.5v9M10.5 3.5v9",
  replay: "M3 8a5 5 0 1 0 1.6-3.7M3 2.8V5.6h2.8",
  speakerOff: "M2.5 6.2h2.3L8 3.4v9.2L4.8 9.8H2.5zM10.5 6l3 4M13.5 6l-3 4",
  speakerOn: "M2.5 6.2h2.3L8 3.4v9.2L4.8 9.8H2.5zM10.6 5.6a3.4 3.4 0 0 1 0 4.8M12.6 3.8a6 6 0 0 1 0 8.4",
  captions: "M2 4.5h12v7H2zM5.4 7.6a1.6 1.6 0 1 0 0 1.6M11 7.6a1.6 1.6 0 1 0 0 1.6",
  minimize: "M3.5 8h9",
  close: "M4 4l8 8M12 4l-8 8",
  reopen: "M8 3.5v5l3.2 1.9M14 8A6 6 0 1 1 2 8a6 6 0 0 1 12 0z",
};

export function Guide() {
  const { t, locale, meta } = useI18n();
  const [panel, setPanel] = useState<Panel>("full");
  const [status, setStatus] = useState<Status>("idle");
  const [muted, setMuted] = useState(false);
  const [captionsOn, setCaptionsOn] = useState(true);
  const [index, setIndex] = useState(0);
  const [note, setNote] = useState<string | null>(null);
  const [showInvite, setShowInvite] = useState(false);
  const reduce = useReducedMotion();

  const script = useMemo(() => t("guide.script"), [t]);
  const sentences = useMemo(() => splitSentences(script), [script]);

  const indexRef = useRef(0);
  const statusRef = useRef<Status>("idle");
  const mutedRef = useRef(false);
  const timerRef = useRef<number | null>(null);
  const cancelOnLocale = useRef(true);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const stopSpeech = useCallback(() => {
    clearTimer();
    if (supported) {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* no-op */
      }
    }
  }, [supported]);

  const setSt = useCallback((s: Status) => {
    statusRef.current = s;
    setStatus(s);
  }, []);

  const captionAdvance = useCallback(
    (idx: number) => {
      if (idx >= sentences.length) {
        setSt("done");
        setIndex(0);
        indexRef.current = 0;
        return;
      }
      indexRef.current = idx;
      setIndex(idx);
      const words = sentences[idx].split(/\s+/).length;
      const delay = Math.min(9000, Math.max(2800, 2000 + words * 420));
      timerRef.current = window.setTimeout(() => {
        captionAdvance(idx + 1);
      }, delay);
    },
    [sentences, setSt]
  );

  const pickVoice = useCallback(
    (): SpeechSynthesisVoice | null => {
      if (!supported) return null;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) return null;
      const prefix = locale.toLowerCase();
      const exact = voices.filter(
        (v) => v.lang.replace("_", "-").toLowerCase().startsWith(prefix)
      );
      if (exact.length === 0) return null;
      const local = exact.find((v) => v.localService);
      return local ?? exact[0];
    },
    [locale, supported]
  );

  const speakFrom = useCallback(
    (idx: number) => {
      clearTimer();
      if (!supported) {
        setNote(t("guide.unsupported"));
        setSt("playing");
        captionAdvance(idx);
        return;
      }
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* no-op */
      }

      if (idx >= sentences.length) {
        setSt("done");
        setIndex(0);
        indexRef.current = 0;
        return;
      }

      const voice = pickVoice();
      if (!voice && meta.coverage === "full") {
        setNote(t("guide.voiceNote"));
      } else {
        setNote(null);
      }

      setSt("playing");
      indexRef.current = idx;
      setIndex(idx);

      const utter = new SpeechSynthesisUtterance(sentences[idx]);
      utter.lang = voice?.lang ?? (locale === "en" ? "en-IN" : locale);
      if (voice) utter.voice = voice;
      utter.rate = 0.98;
      utter.pitch = 1.05;

      utter.onend = () => {
        if (statusRef.current !== "playing") return;
        const next = indexRef.current + 1;
        if (next >= sentences.length) {
          setSt("done");
          setIndex(0);
          indexRef.current = 0;
          return;
        }
        indexRef.current = next;
        setIndex(next);
        window.setTimeout(() => {
          if (statusRef.current === "playing") speakFrom(next);
        }, 120);
      };
      utter.onerror = () => {
        if (statusRef.current !== "playing") return;
        const next = indexRef.current + 1;
        if (next >= sentences.length) {
          setSt("done");
          return;
        }
        indexRef.current = next;
        setIndex(next);
        setNote(t("guide.voiceNote"));
        window.setTimeout(() => {
          if (statusRef.current === "playing") speakFrom(next);
        }, 120);
      };

      window.speechSynthesis.speak(utter);
    },
    [locale, meta.coverage, pickVoice, sentences, supported, t, captionAdvance, setSt]
  );

  const play = useCallback(() => {
    const start = statusRef.current === "done" ? 0 : indexRef.current;
    if (mutedRef.current || !supported) {
      clearTimer();
      setSt("playing");
      captionAdvance(start);
      return;
    }
    speakFrom(start);
  }, [captionAdvance, speakFrom, setSt, supported]);

  const pause = useCallback(() => {
    clearTimer();
    if (supported) {
      try {
        window.speechSynthesis.pause();
      } catch {
        /* no-op */
      }
    }
    setSt("paused");
  }, [setSt, supported]);

  const resume = useCallback(() => {
    setSt("playing");
    if (mutedRef.current || !supported) {
      captionAdvance(indexRef.current);
      return;
    }
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      return;
    }
    speakFrom(indexRef.current);
  }, [captionAdvance, speakFrom, setSt, supported]);

  const replay = useCallback(() => {
    stopSpeech();
    indexRef.current = 0;
    setIndex(0);
    window.setTimeout(() => play(), 60);
  }, [play, stopSpeech]);

  const toggleMute = useCallback(() => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    try {
      window.localStorage.setItem(MUTED_KEY, next ? "1" : "0");
    } catch {
      /* no-op */
    }
    const wasPlaying = statusRef.current === "playing";
    stopSpeech();
    if (wasPlaying) {
      window.setTimeout(() => {
        if (next) {
          setSt("playing");
          captionAdvance(indexRef.current);
        } else {
          speakFrom(indexRef.current);
        }
      }, 80);
    }
  }, [captionAdvance, speakFrom, stopSpeech, setSt]);

  useEffect(() => {
    try {
      const m = window.localStorage.getItem(MUTED_KEY) === "1";
      mutedRef.current = m;
      setMuted(m);
      if (window.localStorage.getItem(SEEN_KEY) !== "1") setShowInvite(true);
    } catch {
      setShowInvite(true);
    }
    return () => stopSpeech();
  }, [stopSpeech]);

  useEffect(() => {
    if (cancelOnLocale.current) {
      cancelOnLocale.current = false;
      return;
    }
    stopSpeech();
    setSt("idle");
    setNote(null);
    indexRef.current = 0;
    setIndex(0);
  }, [locale, stopSpeech, setSt]);

  useEffect(() => {
    if (!supported) return;
    const synth = window.speechSynthesis;
    const ping = window.setInterval(() => {
      if (statusRef.current === "playing" && synth.speaking && !synth.paused) {
        try {
          synth.resume();
        } catch {
          /* no-op */
        }
      }
    }, 8000);
    return () => {
      window.clearInterval(ping);
      try {
        synth.cancel();
      } catch {
        /* no-op */
      }
    };
  }, [supported]);

  useEffect(() => {
    const onToggle = () => {
      setPanel((p) => (p === "full" ? "mini" : "full"));
      if (statusRef.current === "playing") {
        stopSpeech();
        setSt("paused");
      }
    };
    window.addEventListener("sumit:guide-toggle", onToggle);
    return () => window.removeEventListener("sumit:guide-toggle", onToggle);
  }, [setSt, stopSpeech]);

  const dismissInvite = () => {
    setShowInvite(false);
    try {
      window.localStorage.setItem(SEEN_KEY, "1");
    } catch {
      /* no-op */
    }
  };

  const acceptInvite = () => {
    dismissInvite();
    indexRef.current = 0;
    setIndex(0);
    play();
  };

  const closePanel = () => {
    stopSpeech();
    setSt("idle");
    setPanel("hidden");
  };

  if (panel === "hidden") {
    return (
      <div className="fixed bottom-4 end-4 z-40">
        <button
          type="button"
          onClick={() => setPanel("full")}
          aria-label={t("guide.reopen")}
          title={t("guide.reopen")}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink-raised text-glacier shadow-lg shadow-black/40 transition-colors duration-300 hover:border-glacier/50"
        >
          <Icon d={ICONS.reopen} />
        </button>
      </div>
    );
  }

  if (panel === "mini") {
    return (
      <div className="fixed bottom-4 end-4 z-40">
        <button
          type="button"
          onClick={() => setPanel("full")}
          aria-label={t("guide.expand")}
          title={t("guide.expand")}
          className="flex items-center gap-2 rounded-full border border-white/15 bg-ink-raised px-2 py-1.5 text-glacier shadow-lg shadow-black/40 transition-colors duration-300 hover:border-glacier/50"
        >
          <GuideCharacter speaking={false} size={34} />
          <span className="sr-only">{t("guide.expand")}</span>
        </button>
      </div>
    );
  }

  const statusText =
    status === "playing"
      ? t("guide.status.speaking")
      : status === "paused"
        ? t("guide.status.paused")
        : status === "done"
          ? t("guide.status.done")
          : t("guide.status.idle");

  const btn =
    "flex h-8 w-8 items-center justify-center rounded-sm border border-white/12 text-frost-300 transition-colors duration-200 hover:border-glacier/50 hover:text-glacier";

  return (
    <div className="fixed bottom-4 end-4 z-40 flex w-[min(21rem,calc(100vw-2rem))] flex-col items-end gap-3">
      <AnimatePresence>
        {showInvite && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: 8 }}
            transition={{ duration: 0.35, ease: [0.22, 0.61, 0.36, 1] }}
            className="w-full border border-white/12 bg-ink-raised p-4 shadow-xl shadow-black/40"
          >
            <p className="font-display text-[15px] font-normal text-frost-100">
              {t("guide.inviteTitle")}
            </p>
            <p className="mt-1.5 text-[12.5px] leading-relaxed text-frost-400">
              {t("guide.inviteBody")}
            </p>
            <div className="mt-3.5 flex items-center gap-4">
              <button
                type="button"
                onClick={acceptInvite}
                className="border border-glacier/50 px-3 py-1.5 text-[12px] text-glacier transition-colors duration-200 hover:bg-glacier/10"
              >
                {t("guide.accept")}
              </button>
              <button
                type="button"
                onClick={dismissInvite}
                className="text-[12px] text-frost-500 underline-offset-4 hover:text-frost-300 hover:underline"
              >
                {t("guide.dismiss")}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {(captionsOn || note || status !== "idle") && (
        <div className="w-full border border-white/12 bg-ink-raised/95 p-3.5 shadow-xl shadow-black/40 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-label text-glacier/80">
              {t("guide.title")}
            </p>
            <p className="text-[10px] text-frost-500" aria-live="polite">
              {statusText}
            </p>
          </div>
          {captionsOn && (
            <p
              className="mt-2 text-[12.5px] leading-relaxed text-frost-200"
              aria-live="polite"
              aria-atomic="true"
            >
              {sentences[index] ?? script.slice(0, 120)}
            </p>
          )}
          {note && (
            <p className="mt-2 border-t border-white/10 pt-2 text-[11px] leading-relaxed text-frost-500">
              {note}
            </p>
          )}
        </div>
      )}

      <div className="flex items-end gap-2.5">
        <div className="flex items-center gap-1.5 border border-white/12 bg-ink-raised/90 p-1.5 backdrop-blur-sm">
          {status === "playing" ? (
            <button
              type="button"
              onClick={pause}
              className={btn}
              aria-label={t("guide.pause")}
              title={t("guide.pause")}
            >
              <Icon d={ICONS.pause} />
            </button>
          ) : (
            <button
              type="button"
              onClick={status === "paused" ? resume : play}
              className={`${btn} border-glacier/40 text-glacier`}
              aria-label={
                status === "paused" ? t("guide.resume") : t("guide.play")
              }
              title={status === "paused" ? t("guide.resume") : t("guide.play")}
            >
              <Icon d={ICONS.play} filled />
            </button>
          )}
          <button
            type="button"
            onClick={replay}
            className={btn}
            aria-label={t("guide.replay")}
            title={t("guide.replay")}
          >
            <Icon d={ICONS.replay} />
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className={btn}
            aria-label={muted ? t("guide.unmute") : t("guide.mute")}
            title={muted ? t("guide.unmute") : t("guide.mute")}
            aria-pressed={muted}
          >
            <Icon d={muted ? ICONS.speakerOff : ICONS.speakerOn} />
          </button>
          <button
            type="button"
            onClick={() => setCaptionsOn((v) => !v)}
            className={btn}
            aria-label={captionsOn ? t("guide.captions") : t("guide.captionsShow")}
            title={captionsOn ? t("guide.captions") : t("guide.captionsShow")}
            aria-pressed={captionsOn}
          >
            <Icon d={ICONS.captions} />
          </button>
          <span aria-hidden="true" className="mx-0.5 h-4 w-px bg-white/10" />
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              setSt("idle");
              setPanel("mini");
            }}
            className={btn}
            aria-label={t("guide.minimize")}
            title={t("guide.minimize")}
          >
            <Icon d={ICONS.minimize} />
          </button>
          <button
            type="button"
            onClick={closePanel}
            className={btn}
            aria-label={t("guide.close")}
            title={t("guide.close")}
          >
            <Icon d={ICONS.close} />
          </button>
        </div>

        <button
          type="button"
          onClick={() => setPanel("mini")}
          className="shrink-0 rounded-full border border-white/12 bg-ink-raised/90 transition-colors duration-300 hover:border-glacier/50"
          aria-label={t("guide.title")}
          title={t("guide.title")}
        >
          <GuideCharacter speaking={status === "playing"} size={78} />
        </button>
      </div>
    </div>
  );
}
