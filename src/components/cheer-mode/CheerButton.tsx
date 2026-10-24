"use client";

import { forwardRef } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { EqualizerGlyph, HeadphoneGlyph } from "./CheerGlyphs";

export interface CheerButtonProps {
  open: boolean;
  active: boolean;
  background?: boolean;
  onClick: () => void;
}

export const CheerButton = forwardRef<HTMLButtonElement, CheerButtonProps>(
  function CheerButton({ open, active, background, onClick }, ref) {
    const { t } = useI18n();
    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={open ? t("cheer.button") : t("cheer.buttonOpen")}
        className="cheer-btn"
        data-active={active ? "true" : undefined}
        data-background={background ? "true" : undefined}
      >
        <span className="cheer-btn-icon" aria-hidden="true">
          <HeadphoneGlyph className="h-4 w-4" />
        </span>
        <span className="cheer-btn-label">
          {background ? t("cheer.buttonBackground") : t("cheer.button")}
        </span>
        <EqualizerGlyph active={Boolean(background)} />
      </button>
    );
  },
);
