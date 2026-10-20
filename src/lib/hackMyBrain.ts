import type { Challenge } from "@/data/challenges";

export const SCORING = {
  base: 100,
  afterHint1: 75,
  afterHint2: 50,
  timeBonusMax: 20,
} as const;

export type HintLevel = 0 | 1 | 2;

export function normalizeAnswer(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/\s*([,+;:\[\](){}])\s*/g, "$1")
    .replace(/^\[|\]$/g, "")
    .replace(/\s*and\s*/g, ",")
    .replace(/,+/g, ",")
    .replace(/\s*\+\s*/g, "+");
}

export function isChoice(challenge: Challenge): boolean {
  return Array.isArray(challenge.options) && challenge.options.length > 0;
}

export function checkAnswer(challenge: Challenge, value: string): boolean {
  if (!value.trim()) return false;

  if (isChoice(challenge)) {
    const expected = Array.isArray(challenge.answer)
      ? challenge.answer.map((a) => a.toLowerCase())
      : [challenge.answer.toLowerCase()];
    const picked = value.trim().toLowerCase();
    return expected.includes(picked);
  }

  const accepted = Array.isArray(challenge.answer)
    ? challenge.answer
    : [challenge.answer];
  const normalized = normalizeAnswer(value);
  return accepted.some((a) => normalizeAnswer(a) === normalized);
}

export function scoreFor(hintLevel: HintLevel, elapsedSec: number, challenge: Challenge): number {
  let base: number = SCORING.base;
  if (hintLevel === 1) base = SCORING.afterHint1;
  else if (hintLevel >= 2) base = SCORING.afterHint2;

  let bonus = 0;
  if (challenge.timeTargetSec && elapsedSec <= challenge.timeTargetSec) {
    bonus = SCORING.timeBonusMax;
  }
  return base + bonus;
}

export interface AttemptState {
  attempts: number;
  hintLevel: HintLevel;
  solved: boolean;
  earned: number;
  startedAt: number;
  answeredAt?: number;
}

export function initAttempt(now = Date.now()): AttemptState {
  return { attempts: 0, hintLevel: 0, solved: false, earned: 0, startedAt: now };
}

export function formatTime(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}
