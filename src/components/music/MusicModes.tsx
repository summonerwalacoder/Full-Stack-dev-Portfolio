"use client";

import { CheerMode } from "@/components/cheer-mode/CheerMode";
import { FireMode } from "@/components/fire-mode/FireMode";
import { PeakMotivation } from "@/components/PeakMotivation";

/**
 * Shared top-right launcher for Peak Motivation, Cheer Mode, and Fire Mode.
 */
export function MusicModes() {
  return (
    <div
      className="music-modes"
      style={{
        paddingTop: "max(0.6rem, env(safe-area-inset-top))",
        paddingRight: "max(0.6rem, env(safe-area-inset-right))",
      }}
    >
      <PeakMotivation />
      <CheerMode />
      <FireMode />
    </div>
  );
}

