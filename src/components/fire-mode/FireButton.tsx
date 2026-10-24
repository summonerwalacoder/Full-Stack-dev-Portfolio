"use client";

import { forwardRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { FireEqualizer, FlameGlyph } from "./FireGlyphs";

export interface FireButtonProps {
  open: boolean;
  active: boolean;
  background?: boolean;
  onClick: () => void;
}

export const FireButton = forwardRef<HTMLButtonElement, FireButtonProps>(
  function FireButton({ open, active, background, onClick }, ref) {
    const { t } = useI18n();
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? t("fire.button") : t("fire.buttonOpen")}
        className="fire-btn"
        data-active={active ? "true" : undefined}
        data-background={background ? "true" : undefined}
      >
        <span
          className={`fire-btn-flame${active || background ? " is-live" : ""}`}
          aria-hidden="true"
        >
          <FlameGlyph className="h-4 w-4" />
        </span>
        <span className="fire-btn-label">
          {background ? t("fire.buttonBackground") : t("fire.button")}
        </span>
        <FireEqualizer active={Boolean(background)} />
      </button>
    );
  },
);
