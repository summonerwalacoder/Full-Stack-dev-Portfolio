"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { LanguageSelector } from "./LanguageSelector";

const SECTIONS = [
  { id: "home", key: "nav.home" },
  { id: "about", key: "nav.about" },
  { id: "projects", key: "nav.projects" },
  { id: "skills", key: "nav.skills" },
  { id: "journey", key: "nav.journey" },
  { id: "contact", key: "nav.contact" },
] as const;

function GuideGlyph() {
  return (
    <svg viewBox="0 0 20 20" className="h-4 w-4" aria-hidden="true">
      <rect
        x="3.5"
        y="5"
        width="13"
        height="11"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle cx="8" cy="10" r="1.1" fill="currentColor" />
      <circle cx="12" cy="10" r="1.1" fill="currentColor" />
      <path d="M10 5V3" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="10" cy="2.4" r="1" fill="currentColor" />
    </svg>
  );
}

export function Nav() {
  const { t } = useI18n();
  const [active, setActive] = useState<string>("home");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      Boolean
    ) as HTMLElement[];
    if (els.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: [0, 0.25, 0.5] }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => firstLinkRef.current?.focus(), 40);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      window.clearTimeout(timer);
    };
  }, [menuOpen]);

  const toggleGuide = () => {
    window.dispatchEvent(new CustomEvent("sumit:guide-toggle"));
  };

  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:start-4 focus:top-4 focus:z-[70] focus:bg-ink-raised focus:px-4 focus:py-2 focus:text-sm focus:text-glacier"
      >
        {t("a11y.skip")}
      </a>

      <header
        className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
          scrolled
            ? "border-b border-white/[0.08] bg-ink/85 backdrop-blur-md"
            : "border-b border-transparent"
        }`}
      >
        <nav
          aria-label={t("nav.section")}
          className="mx-auto flex h-14 max-w-shell items-center justify-between px-5 md:px-8"
        >
          <a
            href="#home"
            className="text-[11px] font-medium uppercase tracking-wordmark text-frost-100 transition-colors duration-300 hover:text-white"
          >
            Sumit Sharma
          </a>

          <ul className="hidden items-center gap-7 md:flex">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  aria-current={active === s.id ? "true" : undefined}
                  className={`link-underline text-[13px] transition-colors duration-300 ${
                    active === s.id
                      ? "text-frost-50"
                      : "text-frost-400 hover:text-frost-100"
                  }`}
                >
                  {t(s.key)}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <LanguageSelector />
            <button
              type="button"
              onClick={toggleGuide}
              aria-label={t("guide.title")}
              title={t("guide.title")}
              className="ms-1 rounded-sm border border-transparent p-1.5 text-frost-300 transition-colors duration-300 hover:border-white/10 hover:text-glacier"
            >
              <GuideGlyph />
            </button>
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label={t("nav.menu")}
              aria-expanded={menuOpen}
              className="ms-1 flex h-8 w-8 flex-col items-center justify-center gap-1.5 md:hidden"
            >
              <span className="block h-px w-4 bg-frost-200" />
              <span className="block h-px w-4 bg-frost-200" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={reduce ? undefined : { opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[60] bg-ink md:hidden"
            role="dialog"
            aria-modal="true"
            aria-label={t("nav.section")}
          >
            <div className="flex h-14 items-center justify-between px-5">
              <span className="text-[11px] uppercase tracking-wordmark text-frost-300">
                Sumit Sharma
              </span>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  menuButtonRef.current?.focus();
                }}
                aria-label={t("nav.menuClose")}
                className="h-8 w-8 text-frost-300"
              >
                <span className="mx-auto block h-px w-4 rotate-45 bg-current" />
                <span className="mx-auto -mt-px block h-px w-4 -rotate-45 bg-current" />
              </button>
            </div>
            <ul className="mt-6 space-y-1 px-5">
              {SECTIONS.map((s, i) => (
                <li key={s.id}>
                  <a
                    ref={i === 0 ? firstLinkRef : undefined}
                    href={`#${s.id}`}
                    onClick={() => setMenuOpen(false)}
                    className="block border-b border-white/[0.07] py-4 font-display text-3xl font-light text-frost-100"
                  >
                    {t(s.key)}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
