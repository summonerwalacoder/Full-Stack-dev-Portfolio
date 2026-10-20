"use client";

import type { Difficulty } from "@/data/challenges";

interface MissionSelectorProps {
  unlockedSecret: boolean;
  best: Record<string, number>;
  t: (key: string) => string;
  onPick: (difficulty: Difficulty) => void;
}

const MISSIONS: { id: Difficulty; marks: number }[] = [
  { id: "beginner", marks: 1 },
  { id: "intermediate", marks: 2 },
  { id: "advanced", marks: 3 },
  { id: "recruiter", marks: 1 },
];

export function MissionSelector({ unlockedSecret, best, t, onPick }: MissionSelectorProps) {
  const missions = unlockedSecret
    ? [...MISSIONS, { id: "secret" as Difficulty, marks: 4 }]
    : MISSIONS;

  return (
    <div className="px-5 py-6 sm:px-7 sm:py-7">
      <p className="max-w-2xl text-[14px] leading-relaxed text-frost-400">{t("hmb.subtitle")}</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {missions.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onPick(m.id)}
            className={`group flex flex-col rounded-lg border p-5 text-left transition-all duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.99] ${
              m.id === "secret"
                ? "border-glacier/50 bg-glacier/[0.08] hover:bg-glacier/[0.14]"
                : "border-white/[0.12] bg-ink-raised hover:border-glacier/40 hover:bg-glacier/[0.06]"
            }`}
          >
            <span className="flex items-center gap-2" aria-hidden="true">
              {Array.from({ length: 4 }).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-4 rounded-full ${
                    i < m.marks ? "bg-glacier" : "bg-white/10"
                  }`}
                />
              ))}
            </span>
            <span className="mt-3 font-display text-[1.05rem] font-light text-frost-100">
              {t(`hmb.difficulty.${m.id}`)}
            </span>
            <span className="mt-2 text-[13px] leading-relaxed text-frost-400">
              {t(`hmb.desc.${m.id}`)}
            </span>
            {best[m.id] ? (
              <span className="mt-4 font-mono text-[11px] text-glacier">
                {t("hmb.bestScore")}: {best[m.id]}
              </span>
            ) : (
              <span className="mt-4 font-mono text-[11px] text-frost-600 opacity-0 transition-opacity group-hover:opacity-100">
                {t("hmb.start")} →
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
