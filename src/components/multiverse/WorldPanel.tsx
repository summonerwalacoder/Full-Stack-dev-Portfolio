"use client";

import { useEffect, useRef } from "react";
import { ARTIFACT_LABEL, type WorldDef } from "@/data/multiverse";
import { useI18n } from "@/i18n/I18nProvider";

export interface WorldPanelProps {
  world: WorldDef;
  discovered: boolean;
  onClose: () => void;
}

export function WorldPanel({ world, discovered, onClose }: WorldPanelProps) {
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, [world.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="mv-panel"
      style={{ ["--mv-accent" as string]: world.accent, ["--mv-glow" as string]: world.glow }}
      role="dialog"
      aria-modal="false"
      aria-labelledby="mv-panel-title"
    >
      <div className="mv-panel-inner">
        <div className="mv-panel-head">
          <span className="mv-panel-tag">{t(world.tagKey)}</span>
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

        <h3 id="mv-panel-title" className="mv-panel-title">
          {t(world.nameKey)}
        </h3>
        <p className="mv-panel-narrative">{t(world.narrativeKey)}</p>

        <div className={`mv-artifact${discovered ? " is-found" : ""}`}>
          <span className="mv-artifact-gem" aria-hidden="true" />
          <span className="mv-artifact-label">
            {discovered ? t("mv.artifact.found") : t("mv.artifact.hidden")}:{" "}
            {t(ARTIFACT_LABEL[world.artifact])}
          </span>
        </div>

        <ul className="mv-entries">
          {world.entries.map((e) => (
            <li key={e.id} className="mv-entry">
              <span className="mv-entry-title">{t(e.titleKey)}</span>
              <span className="mv-entry-detail">{t(e.detailKey)}</span>
              {e.href && (
                <a
                  className="mv-entry-link"
                  href={e.href}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {t("mv.viewCode")} <span aria-hidden="true">↗</span>
                </a>
              )}
            </li>
          ))}
        </ul>

        {world.links && world.links.length > 0 && (
          <div className="mv-panel-links">
            {world.links.map((l) => (
              <a
                key={l.href}
                className="mv-link"
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t(l.labelKey)}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
