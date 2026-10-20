"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { CV } from "@/data/cv";
import { TERMINAL_OPEN_EVENT } from "./Terminal";

interface Command {
  id: string;
  label: string;
  hint: string;
  keywords: string;
  run: () => void;
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null;
  if (!el) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable === true
  );
}

export function CommandPalette() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const restoreRef = useRef<HTMLElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
  };

  const commands: Command[] = useMemo(
    () => [
      { id: "home", label: t("nav.home"), hint: "Section", keywords: "home top start hero", run: () => scrollToSection("home") },
      { id: "about", label: t("nav.about"), hint: "Section", keywords: "about bio who", run: () => scrollToSection("about") },
      { id: "projects", label: t("nav.projects"), hint: "Section", keywords: "projects work portfolio", run: () => scrollToSection("projects") },
      { id: "skills", label: t("nav.skills"), hint: "Section", keywords: "skills tools tech", run: () => scrollToSection("skills") },
      { id: "journey", label: t("nav.journey"), hint: "Section", keywords: "journey education school", run: () => scrollToSection("journey") },
      { id: "achievements", label: t("achievements.label"), hint: "Section", keywords: "achievements awards certificates", run: () => scrollToSection("achievements") },
      { id: "interests", label: t("interests.label"), hint: "Section", keywords: "interests hobbies cycling", run: () => scrollToSection("interests") },
      { id: "contact", label: t("nav.contact"), hint: "Section", keywords: "contact email message", run: () => scrollToSection("contact") },
      {
        id: "resume",
        label: t("hero.cv"),
        hint: "Open",
        keywords: "resume cv download curriculum vitae pdf",
        run: () => window.open(CV.links.cvFile, "_blank", "noopener,noreferrer"),
      },
      {
        id: "terminal",
        label: t("ui.terminal"),
        hint: "Open",
        keywords: "terminal shell console command line dev",
        run: () => window.dispatchEvent(new CustomEvent(TERMINAL_OPEN_EVENT)),
      },
      {
        id: "github",
        label: "GitHub",
        hint: "External",
        keywords: "github repos summonerwalacoder code",
        run: () => window.open(CV.links.github, "_blank", "noopener,noreferrer"),
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        hint: "External",
        keywords: "linkedin profile network",
        run: () => window.open(CV.links.linkedin, "_blank", "noopener,noreferrer"),
      },
      {
        id: "top",
        label: t("footer.top"),
        hint: "Scroll",
        keywords: "scroll top back home",
        run: () => {
          const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
        },
      },
    ],
    [t],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return commands;
    return commands.filter(
      (c) =>
        c.label.toLowerCase().includes(q) || c.keywords.includes(q),
    );
  }, [commands, query]);

  useEffect(() => {
    const openFromEvent = () => {
      restoreRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    const onKeyDown = (e: globalThis.KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "k") {
        e.preventDefault();
        restoreRef.current = document.activeElement as HTMLElement | null;
        setOpen((prev) => !prev);
        return;
      }
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && !e.altKey && !isTypingTarget(e.target)) {
        e.preventDefault();
        restoreRef.current = document.activeElement as HTMLElement | null;
        setOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("portfolio:palette-open", openFromEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("portfolio:palette-open", openFromEvent);
    };
  }, []);

  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      restoreRef.current?.focus?.();
    }
  }, [open]);

  useEffect(() => {
    setActive((prev) => Math.min(prev, Math.max(0, filtered.length - 1)));
  }, [filtered.length]);

  useEffect(() => {
    const el = listRef.current?.querySelector<HTMLElement>(`[data-index="${active}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const close = () => setOpen(false);

  const runCommand = (index: number) => {
    const cmd = filtered[index];
    if (!cmd) return;
    setOpen(false);
    cmd.run();
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((prev) => (filtered.length ? (prev + 1) % filtered.length : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((prev) => (filtered.length ? (prev - 1 + filtered.length) % filtered.length : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      runCommand(active);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={close}
        className="absolute inset-0 cursor-default bg-ink/75 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("ui.palette")}
        className="relative w-[min(32rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-white/[0.12] bg-ink-raised shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-center gap-3 border-b border-white/[0.09] px-4 py-3">
          <span aria-hidden="true" className="font-mono text-[13px] text-glacier">
            &gt;
          </span>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={t("ui.palette")}
            aria-label={t("ui.palette")}
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 bg-transparent text-[14px] text-frost-100 caret-glacier outline-none placeholder:text-frost-600"
          />
          <kbd className="hidden rounded border border-white/[0.12] px-1.5 py-0.5 font-mono text-[10px] text-frost-500 sm:block">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[min(24rem,55vh)] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <p className="px-4 py-6 text-center text-[13px] text-frost-500">
              No matching commands.
            </p>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.id}
                type="button"
                data-index={i}
                aria-current={i === active ? "true" : undefined}
                onMouseEnter={() => setActive(i)}
                onClick={() => runCommand(i)}
                className={`flex w-full items-center justify-between gap-4 px-4 py-2.5 text-start transition-colors duration-150 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier ${
                  i === active ? "bg-glacier/[0.12] text-frost-50" : "text-frost-300"
                }`}
              >
                <span className="truncate text-[13.5px]">{cmd.label}</span>
                <span className="shrink-0 font-mono text-[10.5px] uppercase tracking-label text-frost-500">
                  {cmd.hint}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/[0.09] px-4 py-2.5 font-mono text-[10.5px] text-frost-600">
          <span>↑↓ navigate · ↵ run</span>
          <span>ctrl/cmd + k or /</span>
        </div>
      </div>
    </div>
  );
}
