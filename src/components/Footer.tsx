"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { TERMINAL_OPEN_EVENT } from "./Terminal";

export function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="mx-auto max-w-shell px-5 pb-28 pt-4 md:px-8 md:pb-16">
      <div className="flex flex-col gap-4 border-t border-white/[0.09] pt-8 text-[12px] text-frost-500 md:flex-row md:items-center md:justify-between">
        <p>
          {t("footer.built")} © {year}
        </p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="hidden sm:inline">{t("footer.stack")}</span>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent(TERMINAL_OPEN_EVENT))}
            className="font-mono text-[11px] text-frost-500 transition-colors duration-300 hover:text-glacier focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
          >
            <span aria-hidden="true" className="me-1.5 text-glacier/70">
              &gt;_
            </span>
            {t("ui.terminal")}
          </button>
          <button
            type="button"
            onClick={() => window.dispatchEvent(new CustomEvent("portfolio:palette-open"))}
            className="font-mono text-[11px] text-frost-500 transition-colors duration-300 hover:text-glacier focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
          >
            {t("ui.palette")}
            <kbd className="ms-2 rounded border border-white/[0.12] px-1 py-px text-[9.5px] text-frost-600">
              ctrl K
            </kbd>
          </button>
          <a href="#home" className="link-underline hover:text-frost-300">
            {t("footer.top")}
          </a>
        </div>
      </div>
    </footer>
  );
}
