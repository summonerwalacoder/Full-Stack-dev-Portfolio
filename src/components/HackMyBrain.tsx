"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { getMission, type Difficulty } from "@/data/challenges";
import { CV } from "@/data/cv";
import {
  initAttempt,
  type AttemptState,
  type HintLevel,
} from "@/lib/hackMyBrain";
import { MissionSelector } from "./hack-my-brain/MissionSelector";
import { ChallengeView } from "./hack-my-brain/ChallengeView";
import { MissionResults } from "./hack-my-brain/MissionResults";
import { BoboMissionGuide, type GuideMood } from "./hack-my-brain/BoboMissionGuide";
import { HMB_OPEN_EVENT, HMB_UNLOCK_EVENT, HMB_BEST_KEY, HMB_SECRET_KEY } from "./hack-my-brain/hmbEvents";

export { HMB_OPEN_EVENT, HMB_UNLOCK_EVENT };
const BEST_KEY = HMB_BEST_KEY;
const SECRET_KEY = HMB_SECRET_KEY;

type View = "selector" | "playing" | "results";

interface ResultRow {
  challenge: ReturnType<typeof getMission>[number];
  solved: boolean;
  earned: number;
  hints: number;
}

function loadBest(): Record<string, number> {
  try {
    const raw = localStorage.getItem(BEST_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function persistBest(
  prev: Record<string, number>,
  d: Difficulty,
  score: number,
  perfect: boolean,
): Record<string, number> {
  if (!perfect) return prev;
  const next = { ...prev, [d]: Math.max(prev[d] ?? 0, score) };
  try {
    localStorage.setItem(BEST_KEY, JSON.stringify(next));
  } catch {
    /* no-op */
  }
  return next;
}

export function HackMyBrain() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<View>("selector");
  const [difficulty, setDifficulty] = useState<Difficulty>("beginner");
  const [index, setIndex] = useState(0);
  const [attempt, setAttempt] = useState<AttemptState>(() => initAttempt());
  const [rows, setRows] = useState<ResultRow[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const [secretUnlocked, setSecretUnlocked] = useState(false);
  const [best, setBest] = useState<Record<string, number>>({});
  const [reduced, setReduced] = useState(false);
  const [guideMood, setGuideMood] = useState<GuideMood>("neutral");
  const [guideMsg, setGuideMsg] = useState("");
  const [guidePulse, setGuidePulse] = useState(0);

  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const startRef = useRef(0);
  const rowsRef = useRef<ResultRow[]>([]);

  const mission = useMemo(() => getMission(difficulty), [difficulty]);
  const current = mission[index];
  const timed = difficulty !== "secret";

  const say = useCallback((key: string, mood: GuideMood) => {
    setGuideMsg(t(key));
    setGuideMood(mood);
    setGuidePulse((p) => p + 1);
  }, [t]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setReduced(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    setBest(loadBest());
    try {
      setSecretUnlocked(localStorage.getItem(SECRET_KEY) === "1");
    } catch {
      /* no-op */
    }
  }, []);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    const onUnlock = () => {
      try {
        localStorage.setItem(SECRET_KEY, "1");
      } catch {
        /* no-op */
      }
      setSecretUnlocked(true);
    };
    window.addEventListener(HMB_OPEN_EVENT, onOpen);
    window.addEventListener(HMB_UNLOCK_EVENT, onUnlock);
    return () => {
      window.removeEventListener(HMB_OPEN_EVENT, onOpen);
      window.removeEventListener(HMB_UNLOCK_EVENT, onUnlock);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const frame = requestAnimationFrame(() => closeRef.current?.focus());
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      cancelAnimationFrame(frame);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    if (!open || view !== "playing" || !timed) return;
    startRef.current = Date.now();
    setElapsed(0);
    const id = window.setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [open, view, timed, difficulty]);

  const reset = useCallback(() => {
    setView("selector");
    setIndex(0);
    setAttempt(initAttempt());
    setRows([]);
    rowsRef.current = [];
    setElapsed(0);
    setGuideMood("neutral");
    setGuideMsg("");
  }, []);

  const start = useCallback(
    (d: Difficulty) => {
      setDifficulty(d);
      setIndex(0);
      setAttempt(initAttempt());
      setRows([]);
      rowsRef.current = [];
      setElapsed(0);
      setView("playing");
      say("hmb.boboStart", "neutral");
    },
    [say],
  );

  const handleSolved = useCallback(
    (earned: number) => {
      if (!current) return;
      const next = [
        ...rowsRef.current,
        { challenge: current, solved: true, earned, hints: attempt.hintLevel },
      ];
      rowsRef.current = next;
      setRows(next);
      setAttempt((a) => ({ ...a, solved: true, earned }));
      const mood: GuideMood = current.difficulty === "recruiter" ? "done" : "correct";
      const pool = ["hmb.boboCorrect", "hmb.boboCorrect2", "hmb.boboCorrect3"];
      say(pool[Math.floor(Math.random() * pool.length)], mood);
    },
    [attempt.hintLevel, current, say],
  );

  const handleWrong = useCallback(() => {
    setAttempt((a) => ({ ...a, attempts: a.attempts + 1 }));
    const pool = ["hmb.boboWrong", "hmb.boboWrong2", "hmb.boboWrong3"];
    say(pool[Math.floor(Math.random() * pool.length)], "wrong");
  }, [say]);

  const handleHint = useCallback(
    (level: HintLevel) => {
      setAttempt((a) => ({ ...a, hintLevel: level }));
      say("hmb.boboHint", "hint");
    },
    [say],
  );

  const handleReveal = useCallback(() => {
    if (!current) return;
    const next = [
      ...rowsRef.current,
      { challenge: current, solved: false, earned: 0, hints: attempt.hintLevel },
    ];
    rowsRef.current = next;
    setRows(next);
    setAttempt((a) => ({ ...a, solved: true }));
  }, [attempt.hintLevel, current]);

  const finish = useCallback(() => {
    const solvedRows = rowsRef.current;
    const score = solvedRows.reduce((s, r) => s + r.earned, 0);
    const solvedCount = solvedRows.filter((r) => r.solved).length;
    const perfect = solvedCount === solvedRows.length && solvedRows.length > 0;
    setBest((prev) => persistBest(prev, difficulty, score, perfect));
    setView("results");
    say("hmb.boboDone", "done");
  }, [difficulty, say]);

  const next = useCallback(() => {
    if (index + 1 >= mission.length) {
      finish();
      return;
    }
    setIndex((i) => i + 1);
    setAttempt(initAttempt());
    say("hmb.boboLevel", "level");
  }, [finish, index, mission.length, say]);

  const goProject = useCallback(
    (id: string, href: string) => {
      window.open(href, "_blank", "noopener,noreferrer");
    },
    [],
  );

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-6">
      <button
        type="button"
        aria-label={t("hmb.close")}
        onClick={() => setOpen(false)}
        className="absolute inset-0 cursor-default bg-ink/85 backdrop-blur-[3px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("hmb.title")}
        className="relative flex max-h-[90vh] w-[min(44rem,100%)] flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-ink-raised shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.09] px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-label text-glacier/80">
              {t("hmb.modeLabel")}
            </p>
            <h2 className="mt-1.5 font-display text-[clamp(1.25rem,3vw,1.7rem)] font-light leading-tight text-frost-50">
              {t("hmb.title")}
            </h2>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={() => setOpen(false)}
            className="shrink-0 rounded border border-white/[0.12] px-3 py-1.5 font-mono text-[11px] text-frost-400 transition-colors hover:border-glacier/40 hover:text-frost-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
          >
            esc
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          {view === "selector" && (
            <MissionSelector
              unlockedSecret={secretUnlocked}
              best={best}
              t={t}
              onPick={start}
            />
          )}

          {view === "playing" && current && (
            <ChallengeView
              challenge={current}
              index={index}
              total={mission.length}
              attempt={attempt}
              timed={timed}
              elapsedSec={elapsed}
              t={t}
              onSolved={handleSolved}
              onWrong={handleWrong}
              onNext={next}
              onHint={handleHint}
              onReveal={handleReveal}
              onProject={goProject}
            />
          )}

          {view === "results" && (
            <MissionResults
              difficulty={difficulty}
              rows={rows}
              elapsedSec={elapsed}
              timed={timed}
              t={t}
              onRestart={() => start(difficulty)}
              onExit={() => {
                setOpen(false);
                reset();
              }}
              onProject={goProject}
            />
          )}
        </div>

        {(view === "selector" || view === "playing") && guideMsg && (
          <div className="border-t border-white/[0.09] bg-ink/40 px-5 py-3 sm:px-7">
            <BoboMissionGuide
              message={guideMsg}
              mood={guideMood}
              pulse={guidePulse}
              reduced={reduced}
              label={CV.name}
            />
          </div>
        )}
      </div>
    </div>
  );
}
