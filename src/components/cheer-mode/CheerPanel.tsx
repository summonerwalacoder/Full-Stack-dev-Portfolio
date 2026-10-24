"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { CatalogueBrowser } from "@/components/music/CatalogueBrowser";
import { useMusic } from "@/components/music/MusicProvider";
import { HeadphoneGlyph } from "./CheerGlyphs";

export interface CheerPanelProps {
  open: boolean;
  suspended?: boolean;
  onClose: () => void;
  /** Track id to auto-play when set (e.g. from a Bobo recommendation). */
  playRequest?: string | null;
  onPlayRequestHandled?: () => void;
}

export function CheerPanel({
  open,
  suspended = false,
  onClose,
  playRequest = null,
  onPlayRequestHandled,
}: CheerPanelProps) {
  const { t } = useI18n();
  const { current, origin, status: playback } = useMusic();
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

  // move focus into the panel only when it transitions to open
  useEffect(() => {
    if (open && !wasOpen.current) {
      closeRef.current?.focus();
    }
    wasOpen.current = open;
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        onClose();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Status reflects the *actual* playback state for tracks started from Cheer.
  // We never claim "Playing" merely because a track is selected.
  const mine = Boolean(current) && origin === "cheer";
  let status: string;
  if (suspended) {
    status = t("cheer.status.paused");
  } else if (!mine || playback === "idle" || playback === "ended") {
    status = t("music.status.ready");
  } else if (playback === "playing") {
    status = t("cheer.status.playing");
  } else if (playback === "paused") {
    status = t("music.status.paused");
  } else if (playback === "error") {
    status = t("music.status.unavailable");
  } else {
    // loading | buffering
    status = t("music.status.connecting");
  }

  return (
    <div
      className={`cheer-panel-anchor${open ? " is-open" : " is-closed"}`}
      aria-hidden={open ? undefined : true}
    >
      <div
        className="cheer-panel"
        role="dialog"
        aria-modal="false"
        aria-label={t("cheer.title")}
      >
        <div className="cheer-panel-head">
          <span className="cheer-panel-badge" aria-hidden="true">
            <HeadphoneGlyph className="h-4 w-4" />
          </span>
          <div className="cheer-panel-heading">
            <p className="cheer-panel-title">{t("cheer.title")}</p>
            <p className="cheer-panel-sub">{t("cheer.subtitle")}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="cheer-close"
            onClick={onClose}
            tabIndex={open ? undefined : -1}
            aria-label={t("cheer.close")}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p className="cheer-status" role="status" aria-live="polite">
          <span
            className={`cheer-status-dot${suspended ? " is-suspended" : ""}`}
            aria-hidden="true"
          />
          {status}
        </p>

        <div className="cheer-body">
          <CatalogueBrowser
            mode="cheer"
            open={open}
            playRequest={playRequest}
            onPlayRequestHandled={onPlayRequestHandled}
          />
        </div>
      </div>
    </div>
  );
}
