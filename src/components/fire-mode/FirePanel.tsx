"use client";

import { useEffect, useRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { FIRE_SETS, type FireSet, type FireSetId } from "@/data/fireMode";
import { FirePlayer } from "./FirePlayer";
import { FlameGlyph } from "./FireGlyphs";

export interface FirePanelProps {
  open: boolean;
  set: FireSet | null;
  setId: FireSetId | null;
  suspended: boolean;
  onSelectSet: (id: FireSetId) => void;
  onClose: () => void;
}

export function FirePanel({
  open,
  set,
  setId,
  suspended,
  onSelectSet,
  onClose,
}: FirePanelProps) {
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  const wasOpen = useRef(false);

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

  const status = suspended ? t("fire.status.paused") : t("fire.status.embed");

  return (
    <div
      className={`fire-panel-anchor${open ? " is-open" : " is-closed"}`}
      aria-hidden={open ? undefined : true}
    >
      <div className="fire-panel" role="dialog" aria-modal="false" aria-label={t("fire.title")}>
        <div className="fire-glow" aria-hidden="true" />

        <div className="fire-panel-head">
          <span className="fire-panel-badge" aria-hidden="true">
            <FlameGlyph className="h-4 w-4" />
          </span>
          <div className="fire-panel-heading">
            <p className="fire-panel-title">{t("fire.title")}</p>
            <p className="fire-panel-sub">{t("fire.subtitle")}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="fire-close"
            onClick={onClose}
            tabIndex={open ? undefined : -1}
            aria-label={t("fire.close")}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <p className="fire-status" role="status" aria-live="polite">
          <span className={`fire-status-dot${suspended ? " is-suspended" : ""}`} aria-hidden="true" />
          {status}
        </p>

        <div className="fire-body">
          <p className="fire-section-label">{t("fire.sets")}</p>
          <ul className="fire-sets">
            {FIRE_SETS.map((s) => {
              const selected = s.id === setId;
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    className={`fire-set${selected ? " is-active" : ""}`}
                    aria-pressed={selected}
                    tabIndex={open ? undefined : -1}
                    onClick={() => onSelectSet(s.id)}
                  >
                    <span className="fire-set-glyph" aria-hidden="true">
                      {s.glyph}
                    </span>
                    <span className="fire-set-text">
                      <span className="fire-set-name">{t(s.labelKey)}</span>
                      <span className="fire-set-desc">{t(s.descriptionKey)}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="fire-player-host" aria-live="polite">
            <FirePlayer set={set} open={open} suspended={suspended} />
          </div>
          {set && (
            <a
              className="fire-listen-link"
              href={`https://open.spotify.com/playlist/${set.playlistId}`}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={open ? undefined : -1}
            >
              {t("fire.listenOnSpotify")}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export { FIRE_SETS };
