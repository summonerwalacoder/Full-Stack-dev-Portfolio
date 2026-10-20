"use client";

import { useEffect, useRef, useState } from "react";
import { BoboCharacter, type BoboMode } from "@/components/bobo/BoboCharacter";
import { playBoop } from "@/components/bobo/boboAudio";

export type GuideMood = "neutral" | "correct" | "wrong" | "hint" | "level" | "done";

export interface BoboMissionGuideProps {
  message: string;
  mood: GuideMood;
  /** increments every time the message changes, so repeat lines still re-trigger */
  pulse: number;
  reduced: boolean;
  label: string;
}

const MOOD_MODE: Record<GuideMood, BoboMode> = {
  neutral: "talk",
  correct: "laugh",
  wrong: "talk",
  hint: "talk",
  level: "laugh",
  done: "wave",
};

export function BoboMissionGuide({
  message,
  mood,
  pulse,
  reduced,
  label,
}: BoboMissionGuideProps) {
  const [mouth, setMouth] = useState(0.12);
  const [mode, setMode] = useState<BoboMode>("talk");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (reduced) {
      setMouth(0.3);
      setMode(MOOD_MODE[mood]);
      return;
    }
    setMode(MOOD_MODE[mood]);
    playBoop();

    let frame = 0;
    const seq = [0.7, 0.25, 0.85, 0.35, 0.6, 0.2, 0.5];
    const step = () => {
      setMouth(seq[frame % seq.length]);
      frame += 1;
      timerRef.current = window.setTimeout(step, 130);
    };
    step();

    const settle = window.setTimeout(() => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setMouth(0.12);
    }, 1400);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.clearTimeout(settle);
      setMouth(0.12);
    };
  }, [pulse, mood, reduced]);

  return (
    <div className="flex items-start gap-3">
      <div className="h-14 w-11 shrink-0" aria-hidden="true">
        <BoboCharacter mode={mode} mouth={mouth} pupilX={0} pupilY={2} listening={false} />
      </div>
      <p
        className="flex-1 pt-2 text-[13.5px] leading-relaxed text-frost-300"
        role="status"
        aria-live="polite"
      >
        <span className="sr-only">{label}: </span>
        {message}
      </p>
    </div>
  );
}
