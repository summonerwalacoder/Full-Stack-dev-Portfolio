"use client";

import { useState } from "react";
import type { Challenge, Difficulty } from "@/data/challenges";
import { formatTime } from "@/lib/hackMyBrain";
import { CV } from "@/data/cv";

interface ResultRow {
  challenge: Challenge;
  solved: boolean;
  earned: number;
  hints: number;
}

interface MissionResultsProps {
  difficulty: Difficulty;
  rows: ResultRow[];
  elapsedSec: number;
  timed: boolean;
  t: (key: string) => string;
  onRestart: () => void;
  onExit: () => void;
  onProject: (id: string, href: string) => void;
}

export function MissionResults({
  difficulty,
  rows,
  elapsedSec,
  timed,
  t,
  onRestart,
  onExit,
  onProject,
}: MissionResultsProps) {
  const [copied, setCopied] = useState(false);
  const solved = rows.filter((r) => r.solved);
  const score = rows.reduce((sum, r) => sum + r.earned, 0);
  const total = rows.length;
  const perfect = solved.length === total;
  const ratio = solved.length / total;

  const feedback =
    ratio === 1
      ? t("hmb.perfect")
      : ratio >= 0.7
        ? t("hmb.feedbackGreat")
        : ratio >= 0.4
          ? t("hmb.feedbackGood")
          : t("hmb.feedbackKeep");

  const topics = Array.from(
    new Set(rows.map((r) => t(r.challenge.titleKey))),
  );

  const summary = [
    `${t("hmb.developerCardTitle")} — ${CV.name}`,
    `${t("hmb.difficulty." + difficulty)}`,
    `${t("hmb.challengesSolved")}: ${solved.length}/${total}`,
    `${t("hmb.score")}: ${score}`,
    timed ? `${t("hmb.timeTaken")}: ${formatTime(elapsedSec)}` : t("hmb.timerOff"),
    "",
    feedback,
  ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="px-5 py-6 sm:px-7 sm:py-7">
      <div className="rounded-lg border border-glacier/30 bg-glacier/[0.06] p-5 sm:p-6">
        <p className="text-[11px] uppercase tracking-label text-glacier/80">
          {t("hmb.missionComplete")}
        </p>
        <h3 className="mt-2 font-display text-[clamp(1.3rem,3vw,1.7rem)] font-light text-frost-50">
          {t("hmb.developerCardTitle")}
        </h3>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat label={t("hmb.challengesSolved")} value={`${solved.length}/${total}`} />
          <Stat label={t("hmb.score")} value={String(score)} />
          <Stat
            label={t("hmb.timeTaken")}
            value={timed ? formatTime(elapsedSec) : "—"}
          />
          <Stat
            label={t("hmb.hintsUsed")}
            value={String(rows.reduce((s, r) => s + r.hints, 0))}
          />
        </div>

        <p className="mt-5 text-[14px] leading-relaxed text-frost-300">{feedback}</p>
        {!timed && <p className="mt-1 text-[11.5px] text-frost-500">{t("hmb.noTimerNote")}</p>}

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/[0.1] pt-5">
          <span className="text-[11px] uppercase tracking-label text-frost-500">
            {t("hmb.yourTopics")}
          </span>
          <span className="text-[13px] text-frost-400">{topics.join(" · ")}</span>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-white/[0.1] bg-ink-raised p-5">
        <p className="text-[11px] uppercase tracking-label text-frost-500">
          {t("hmb.reviewTitle")}
        </p>
        {solved.length === total ? (
          <p className="mt-3 text-[13.5px] text-frost-400">{t("hmb.reviewEmpty")}</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {rows
              .filter((r) => !r.solved)
              .map((r) => (
                <li key={r.challenge.id} className="text-[13.5px] leading-relaxed text-frost-400">
                  <span className="me-2 text-frost-500">{t(r.challenge.titleKey)}</span>
                  {t(r.challenge.solutionKey)}
                </li>
              ))}
          </ul>
        )}

        {solved.some((r) => r.challenge.project) && (
          <div className="mt-5 border-t border-white/[0.09] pt-4">
            <p className="text-[11px] uppercase tracking-label text-frost-500">
              {t("hmb.exploreProject")}
            </p>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
              {Array.from(
                new Map(
                  solved
                    .filter((r) => r.challenge.project)
                    .map((r) => [r.challenge.project!.id, r.challenge.project!]),
                ).values(),
              ).map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onProject(p.id, p.href)}
                  className="link-underline text-[13px] text-frost-300 transition-colors hover:text-glacier"
                >
                  {p.href.split("/").pop()}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="rounded border border-glacier/50 bg-glacier/[0.1] px-5 py-2 text-[12.5px] uppercase tracking-label text-frost-50 transition-all duration-300 hover:bg-glacier/[0.16] focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
        >
          {t("hmb.restart")}
        </button>
        <button
          type="button"
          onClick={copy}
          className="rounded border border-white/[0.14] px-5 py-2 text-[12.5px] uppercase tracking-label text-frost-400 transition-colors duration-300 hover:border-glacier/40 hover:text-frost-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
        >
          {copied ? t("hmb.copied") : t("hmb.copySummary")}
        </button>
        <button
          type="button"
          onClick={onExit}
          className="ms-auto text-[12.5px] uppercase tracking-label text-frost-500 transition-colors hover:text-frost-200"
        >
          {t("hmb.returnPortfolio")}
        </button>
      </div>

      {(difficulty === "recruiter" || difficulty === "secret") && (
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.09] pt-5">
          <p className="flex-1 text-[13.5px] leading-relaxed text-frost-400">
            {t("hmb.recruiterSkills")}
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={CV.links.cvFile}
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline text-[13px] text-frost-300 transition-colors hover:text-glacier"
            >
              {t("hmb.openCv")}
            </a>
            <a
              href={`mailto:${CV.email}`}
              className="link-underline text-[13px] text-frost-300 transition-colors hover:text-glacier"
            >
              {t("hmb.contact")}
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-[10.5px] uppercase tracking-label text-frost-500">{label}</p>
      <p className="mt-1 font-display text-[1.3rem] font-light text-frost-100">{value}</p>
    </div>
  );
}
