"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { DICTIONARIES, DEFAULT_LOCALE, LOCALES, getLocaleMeta, isRtl } from "./index";
import type { LocaleMeta } from "./config";

const STORAGE_KEY = "sumit.lang";

export interface I18nContextValue {
  locale: string;
  meta: LocaleMeta;
  setLocale: (code: string) => void;
  t: (key: string) => string;
  available: boolean;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function detectInitialLocale(): string {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  try {
    const params = new URLSearchParams(window.location.search);
    const fromUrl = params.get("lang");
    if (fromUrl && LOCALES.some((l) => l.code === fromUrl)) return fromUrl;
  } catch {
    /* no-op */
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved && LOCALES.some((l) => l.code === saved)) return saved;
  } catch {
    /* no-op */
  }
  const nav = window.navigator.language?.toLowerCase() ?? "en";
  const base = nav.split("-")[0];
  if (LOCALES.some((l) => l.code === base)) return base;
  return DEFAULT_LOCALE;
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<string>(DEFAULT_LOCALE);
  const first = useRef(true);

  useEffect(() => {
    setLocaleState(detectInitialLocale());
  }, []);

  useEffect(() => {
    const meta = getLocaleMeta(locale);
    const root = document.documentElement;
    root.lang = locale;
    root.dir = meta.dir;
    root.dataset.locale = locale;
    root.dataset.script = meta.script;
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      /* no-op */
    }
    try {
      const url = new URL(window.location.href);
      if (locale === DEFAULT_LOCALE) url.searchParams.delete("lang");
      else url.searchParams.set("lang", locale);
      window.history.replaceState(null, "", url.toString());
    } catch {
      /* no-op */
    }
    first.current = false;
  }, [locale]);

  const setLocale = useCallback((code: string) => {
    if (!LOCALES.some((l) => l.code === code)) return;
    setLocaleState(code);
  }, []);

  const t = useCallback(
    (key: string) => {
      const dict = DICTIONARIES[locale];
      if (dict && dict[key] != null && dict[key] !== "") return dict[key];
      const fallback = DICTIONARIES[DEFAULT_LOCALE];
      return fallback[key] ?? key;
    },
    [locale]
  );

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      meta: getLocaleMeta(locale),
      setLocale,
      t,
      available: LOCALES.some((l) => l.code === locale),
    }),
    [locale, setLocale, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}

export function useT() {
  return useI18n().t;
}

export function useIsRtl() {
  const { locale } = useI18n();
  return isRtl(locale);
}
