"use client";

import { useEffect, useRef } from "react";
import { CENTER } from "@/data/multiverse";
import { useI18n } from "@/i18n/I18nProvider";

export interface CenterPanelProps {
  speaking: boolean;
  onClose: () => void;
}

export function CenterPanel({ speaking, onClose }: CenterPanelProps) {
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="mv-panel mv-center-panel"
      style={{ ["--mv-accent" as string]: "#8fb6ff", ["--mv-glow" as string]: "143,178,255" }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="mv-center-title"
    >
      <div className="mv-panel-inner">
        <div className="mv-panel-head">
          <span className="mv-panel-tag">{t(CENTER.tagKey)}</span>
          <button
            ref={closeRef}
            type="button"
            className="mv-close"
            onClick={onClose}
            aria-label={t("mv.close")}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>

        <div className="mv-center-hero">
          <span className="mv-center-avatar" aria-hidden="true">
            <span className="mv-center-ring" />
            <span className="mv-center-ring mv-center-ring-2" />
            <span className="mv-center-face">SK</span>
            <span className="mv-center-spark mv-center-spark-1" />
            <span className="mv-center-spark mv-center-spark-2" />
            <span className="mv-center-spark mv-center-spark-3" />
          </span>
          <div className="mv-center-id">
            <h3 id="mv-center-title" className="mv-panel-title">
              {t(CENTER.nameKey)}
            </h3>
            <p className="mv-center-role">{t(CENTER.roleKey)}</p>
          </div>
        </div>

        <p className="mv-panel-narrative mv-center-intro">{t(CENTER.introKey)}</p>

        <div className={`mv-center-voice${speaking ? " is-speaking" : ""}`}>
          <span className="mv-center-wave" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
        </div>

        <p className="mv-center-note">{t(CENTER.noteKey)}</p>
      </div>
    </div>
  );
}
