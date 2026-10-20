"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LOCALES } from "@/i18n/config";
import { useI18n } from "@/i18n/I18nProvider";

function GlobeIcon() {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.2"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="6.25" />
      <ellipse cx="8" cy="8" rx="2.7" ry="6.25" />
      <path d="M2 8h12M3.1 4.6h9.8M3.1 11.4h9.8" />
    </svg>
  );
}

export function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKey);
    const timer = window.setTimeout(() => searchRef.current?.focus(), 30);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKey);
      window.clearTimeout(timer);
    };
  }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = LOCALES.filter((l) => {
    if (!q) return true;
    return (
      l.englishName.toLowerCase().includes(q) ||
      l.nativeName.toLowerCase().includes(q) ||
      l.code.toLowerCase() === q
    );
  });

  const groups: { key: "full" | "core" | "pending"; label: string }[] = [
    { key: "full", label: t("lang.full") },
    { key: "core", label: t("lang.core") },
    { key: "pending", label: t("lang.soon") },
  ];

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t("lang.label")}
        className="flex items-center gap-1.5 rounded-sm border border-transparent px-2 py-1.5 text-[11px] uppercase tracking-[0.14em] text-frost-300 transition-colors duration-300 hover:border-white/10 hover:text-frost-50"
      >
        <GlobeIcon />
        <span>{locale.toUpperCase()}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0, y: -6 }}
            transition={{ duration: 0.22, ease: [0.22, 0.61, 0.36, 1] }}
            className="absolute end-0 z-50 mt-2 w-[19rem] max-w-[calc(100vw-2rem)] border border-white/10 bg-ink-raised shadow-2xl shadow-black/40"
            role="dialog"
            aria-label={t("lang.label")}
          >
            <div className="border-b border-white/10 p-3">
              <label className="sr-only" htmlFor="lang-search">
                {t("lang.search")}
              </label>
              <input
                id="lang-search"
                ref={searchRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t("lang.search")}
                className="w-full border-b border-white/10 bg-transparent pb-1.5 text-sm text-frost-100 placeholder:text-frost-500 focus:outline-none"
              />
            </div>
            <ul
              className="max-h-72 overflow-y-auto py-1"
              role="listbox"
              aria-label={t("lang.label")}
            >
              {filtered.map((l) => {
                const selected = l.code === locale;
                const disabled = l.coverage === "pending";
                return (
                  <li key={l.code}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={disabled}
                      onClick={() => {
                        setLocale(l.code);
                        setOpen(false);
                        buttonRef.current?.focus();
                      }}
                      className={`flex w-full items-baseline justify-between gap-3 px-3 py-2 text-start transition-colors duration-200 ${
                        disabled
                          ? "cursor-not-allowed opacity-40"
                          : "hover:bg-white/[0.05]"
                      } ${selected ? "bg-white/[0.06]" : ""}`}
                    >
                      <span className="flex flex-col">
                        <span className="text-sm text-frost-100">
                          {l.nativeName}
                        </span>
                        <span className="text-[11px] text-frost-500">
                          {l.englishName}
                        </span>
                      </span>
                      <span
                        className={`mt-0.5 shrink-0 text-[10px] uppercase tracking-[0.12em] ${
                          l.coverage === "full"
                            ? "text-glacier"
                            : "text-frost-500"
                        }`}
                      >
                        {l.coverage === "full"
                          ? t("lang.full")
                          : l.coverage === "core"
                            ? t("lang.core")
                            : t("lang.soon")}
                      </span>
                    </button>
                  </li>
                );
              })}
              {filtered.length === 0 && (
                <li className="px-3 py-4 text-sm text-frost-500">
                  {t("lang.search")}
                </li>
              )}
            </ul>
            <p className="border-t border-white/10 px-3 py-2.5 text-[11px] leading-relaxed text-frost-500">
              {t("lang.note")} {t("lang.pendingNote")}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
