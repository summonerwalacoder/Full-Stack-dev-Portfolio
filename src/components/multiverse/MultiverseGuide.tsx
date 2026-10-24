"use client";

import { useEffect, useRef, useState } from "react";
import { BoboCharacter, type BoboMode } from "@/components/bobo/BoboCharacter";
import { playBoop, speakJoke } from "@/components/bobo/boboAudio";
import { useI18n } from "@/i18n/I18nProvider";

export interface MultiverseGuideProps {
  messageKey: string | null;
  pulse: number;
  muted: boolean;
  reduced: boolean;
}

export function MultiverseGuide({
  messageKey,
  pulse,
  muted,
  reduced,
}: MultiverseGuideProps) {
  const { t, locale } = useI18n();
  const [mouth, setMouth] = useState(0.12);
  const [mode, setMode] = useState<BoboMode>("talk");
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    if (!messageKey) return;
    const text = t(messageKey);
    if (reduced) {
      setMouth(0.3);
      setMode("talk");
      return;
    }
    setMode("talk");
    if (!muted) playBoop();
    if (!muted) speakJoke(text, locale, { onEnd: () => setMode("talk") });

    let frame = 0;
    const seq = [0.7, 0.28, 0.85, 0.34, 0.58, 0.22];
    const step = () => {
      setMouth(seq[frame % seq.length]);
      frame += 1;
      timerRef.current = window.setTimeout(step, 135);
    };
    step();
    const settle = window.setTimeout(() => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      setMouth(0.12);
    }, 1400);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.clearTimeout(settle);
    };
  }, [pulse, messageKey, muted, reduced, t, locale]);

  return (
    <div className="mv-guide" aria-hidden={!messageKey}>
      <div className="mv-guide-avatar" aria-hidden="true">
        <BoboCharacter mode={mode} mouth={mouth} pupilX={0} pupilY={2} listening={false} />
      </div>
      {messageKey && (
        <p className="mv-guide-text" role="status" aria-live="polite">
          {t(messageKey)}
        </p>
      )}
    </div>
  );
}
