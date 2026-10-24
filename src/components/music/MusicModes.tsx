"use client";

import { CheerMode } from "@/components/cheer-mode/CheerMode";
import { FireMode } from "@/components/fire-mode/FireMode";

/**
 * Shared top-right launcher that holds the music companions (Cheer Mode and
 * Fire Mode) side by side. Only one panel can be open at a time because opening
 * one dispatches the other's close event.
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
      <CheerMode />
      <FireMode />
    </div>
  );
}
