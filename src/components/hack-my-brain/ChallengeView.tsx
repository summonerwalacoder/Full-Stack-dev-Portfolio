"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Challenge } from "@/data/challenges";
import {
  checkAnswer,
  formatTime,
  isChoice,
  scoreFor,
  type AttemptState,
  type HintLevel,
} from "@/lib/hackMyBrain";

interface ChallengeViewProps {
  challenge: Challenge;
  index: number;
  total: number;
  attempt: AttemptState;
  timed: boolean;
  elapsedSec: number;
  t: (key: string) => string;
  onSolved: (earned: number) => void;
  onWrong: () => void;
  onNext: () => void;
  onHint: (level: HintLevel) => void;
  onReveal: () => void;
  onProject: (id: string, href: string) => void;
}

export function ChallengeView({
  challenge,
  index,
  total,
  attempt,
  timed,
  elapsedSec,
  t,
  onSolved,
  onWrong,
  onNext,
  onHint,
  onReveal,
  onProject,
}: ChallengeViewProps) {
  const [value, setValue] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "wrong">("idle");
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const headingId = useId();

  useEffect(() => {
    setValue("");
    setStatus("idle");
    setRevealed(false);
  }, [challenge.id]);

  useEffect(() => {
    if (!isChoice(challenge)) inputRef.current?.focus();
  }, [challenge]);

  const submit = () => {
    if (attempt.solved) return;
    if (checkAnswer(challenge, value)) {
      setStatus("correct");
      const earned = scoreFor(attempt.hintLevel, elapsedSec, challenge);
      onSolved(earned);
    } else {
      setStatus("wrong");
      onWrong();
    }
  };

  const choice = isChoice(challenge);
  const solved = attempt.solved;

  return (
    <div className="flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-white/[0.09] px-5 py-3 sm:px-7">
        <p className="font-mono text-[11px] uppercase tracking-label text-frost-500">
          {t("hmb.challengeOf")} {index + 1} / {total}
        </p>
        <div className="flex items-center gap-4 font-mono text-[11px] text-frost-500">
          <span>
            {t("hmb.elapsed")} {formatTime(elapsedSec)}
          </span>
          <span aria-hidden="true" className="text-frost-600">
            ·
          </span>
          {timed ? <span>{t("hmb.timed")}</span> : <span>{t("hmb.timerOff")}</span>}
        </div>
      </div>

      <div className="px-5 py-5 sm:px-7 sm:py-6">
        <p className="text-[11px] uppercase tracking-label text-glacier/80">{t(challenge.titleKey)}</p>
        <h3
          id={headingId}
          className="mt-2 text-[15px] leading-relaxed text-frost-200"
        >
          {t(challenge.promptKey)}
        </h3>

        <pre className="hmb-code mt-5 overflow-x-auto rounded border border-white/[0.1] bg-ink p-4 font-mono text-[12.5px] leading-relaxed text-frost-300">
          <code>{challenge.code}</code>
        </pre>

        {choice ? (
          <fieldset
            className="mt-5 space-y-2"
            role="group"
            aria-labelledby={headingId}
          >
            <legend className="sr-only">{t("hmb.answerLabel")}</legend>
            {challenge.options!.map((opt) => {
              const selected = value === opt.key;
              return (
                <label
                  key={opt.key}
                  className={`flex cursor-pointer items-start gap-3 rounded border px-4 py-3 text-[13.5px] leading-relaxed transition-colors duration-200 ${
                    selected
                      ? "border-glacier/60 bg-glacier/[0.1] text-frost-100"
                      : "border-white/[0.1] text-frost-300 hover:border-glacier/40"
                  } ${solved ? "cursor-default opacity-70" : ""}`}
                >
                  <input
                    type="radio"
                    name={challenge.id}
                    value={opt.key}
                    checked={selected}
                    disabled={solved}
                    onChange={() => {
                      setValue(opt.key);
                      setStatus("idle");
                    }}
                    className="mt-1 accent-glacier"
                  />
                  <span>
                    <span className="me-2 font-mono text-frost-500">{opt.key}</span>
                    {t(opt.textKey)}
                  </span>
                </label>
              );
            })}
          </fieldset>
        ) : (
          <div className="mt-5">
            <label
              htmlFor={`${challenge.id}-input`}
              className="block text-[11px] uppercase tracking-label text-frost-500"
            >
              {t("hmb.answerLabel")}
            </label>
            <input
              id={`${challenge.id}-input`}
              ref={inputRef}
              type="text"
              value={value}
              disabled={solved}
              autoComplete="off"
              spellCheck={false}
              onChange={(e) => {
                setValue(e.target.value);
                setStatus("idle");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  submit();
                }
              }}
              placeholder={t(challenge.placeholderKey ?? "hmb.answerPlaceholder")}
              className="mt-2 w-full rounded border border-white/[0.14] bg-ink px-4 py-2.5 font-mono text-[14px] text-frost-100 outline-none transition-colors placeholder:text-frost-600 focus:border-glacier/60 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier disabled:opacity-60"
            />
          </div>
        )}

        {status === "correct" && (
          <p role="status" className="mt-4 flex items-center gap-2 text-[13.5px] text-glacier">
            <span aria-hidden="true">✓</span>
            {t("hmb.correct")}
          </p>
        )}
        {status === "wrong" && !solved && (
          <p role="alert" className="mt-4 flex items-center gap-2 text-[13.5px] text-frost-400">
            <span aria-hidden="true" className="text-glacier/70">
              ✗
            </span>
            {t("hmb.incorrect")}
          </p>
        )}

        {attempt.hintLevel > 0 && (
          <div className="mt-5 space-y-2 rounded border border-white/[0.1] bg-ink-raised p-4">
            {attempt.hintLevel >= 1 && (
              <p className="text-[13px] leading-relaxed text-frost-400">
                <span className="me-2 font-mono text-[11px] uppercase tracking-label text-glacier/80">
                  {t("hmb.hint1")}
                </span>
                {t(challenge.hint1Key)}
              </p>
            )}
            {attempt.hintLevel >= 2 && (
              <p className="text-[13px] leading-relaxed text-frost-400">
                <span className="me-2 font-mono text-[11px] uppercase tracking-label text-glacier/80">
                  {t("hmb.hint2")}
                </span>
                {t(challenge.hint2Key)}
              </p>
            )}
            <p className="pt-1 text-[11.5px] text-frost-600">{t("hmb.penaltyNote")}</p>
          </div>
        )}

        {revealed && (
          <div className="mt-5 rounded border border-glacier/30 bg-glacier/[0.06] p-4">
            <p className="text-[13px] leading-relaxed text-frost-300">
              <span className="me-2 font-mono text-[11px] uppercase tracking-label text-glacier/80">
                {t("hmb.solution")}
              </span>
              {t(challenge.solutionKey)}
            </p>
            <p className="mt-2 text-[11.5px] text-frost-500">{t("hmb.solutionRevealed")}</p>
          </div>
        )}

        {challenge.project && solved && (
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded border border-white/[0.1] bg-ink-raised p-4">
            <p className="text-[13px] leading-relaxed text-frost-400">
              {t("hmb.projectInvite")}
            </p>
            <button
              type="button"
              onClick={() => onProject(challenge.project!.id, challenge.project!.href)}
              className="shrink-0 rounded border border-white/[0.14] px-4 py-2 text-[12px] uppercase tracking-label text-frost-300 transition-all duration-300 hover:border-glacier/50 hover:bg-glacier/[0.08] hover:text-frost-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
            >
              {t("hmb.exploreProject")}
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-white/[0.09] px-5 py-4 sm:px-7">
        {!solved && !revealed && (
          <>
            <button
              type="button"
              onClick={submit}
              disabled={!value.trim()}
              className="rounded border border-glacier/50 bg-glacier/[0.1] px-5 py-2 text-[12.5px] uppercase tracking-label text-frost-50 transition-all duration-300 hover:bg-glacier/[0.16] focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("hmb.submit")}
            </button>
            <button
              type="button"
              onClick={() => onHint(attempt.hintLevel >= 2 ? 2 : ((attempt.hintLevel + 1) as HintLevel))}
              disabled={attempt.hintLevel >= 2}
              className="rounded border border-white/[0.14] px-4 py-2 text-[12.5px] uppercase tracking-label text-frost-400 transition-colors duration-300 hover:border-glacier/40 hover:text-frost-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {attempt.hintLevel === 0 ? t("hmb.hint1") : attempt.hintLevel === 1 ? t("hmb.hint2") : t("hmb.hint")}
            </button>
            <button
              type="button"
              onClick={() => {
                setRevealed(true);
                setStatus("idle");
                onReveal();
              }}
              className="ms-auto text-[12px] text-frost-500 underline decoration-white/20 underline-offset-4 transition-colors hover:text-frost-200"
            >
              {t("hmb.revealSolution")}
            </button>
          </>
        )}

        {(solved || revealed) && (
          <button
            type="button"
            onClick={onNext}
            className="ms-auto rounded border border-glacier/50 bg-glacier/[0.1] px-5 py-2 text-[12.5px] uppercase tracking-label text-frost-50 transition-all duration-300 hover:bg-glacier/[0.16] focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
          >
            {index + 1 === total ? t("hmb.finish") : t("hmb.next")}
          </button>
        )}

        {attempt.hintLevel > 0 && !solved && !revealed && (
          <span className="font-mono text-[11px] text-frost-600">{t("hmb.hint")}</span>
        )}
      </div>
    </div>
  );
}
