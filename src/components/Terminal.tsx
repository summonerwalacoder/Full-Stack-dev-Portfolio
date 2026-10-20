"use client";

import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { CV } from "@/data/cv";
import { PROJECTS, MINOR_PROJECTS } from "@/data/projects";
import { HMB_UNLOCK_EVENT } from "./hack-my-brain/hmbEvents";

export const TERMINAL_OPEN_EVENT = "portfolio:terminal-open";

type Line = { text: string; href?: string; tone?: "dim" | "accent" };

const PROMPT = "sumit@portfolio:~$";

export function Terminal() {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [lines, setLines] = useState<Line[]>([
    { text: "Portfolio developer terminal", tone: "accent" },
    { text: "Type \"help\" and press Enter to see the available commands.", tone: "dim" },
  ]);

  const inputRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const openHandler = () => {
      restoreRef.current = document.activeElement as HTMLElement | null;
      setOpen(true);
    };
    window.addEventListener(TERMINAL_OPEN_EVENT, openHandler);
    return () => window.removeEventListener(TERMINAL_OPEN_EVENT, openHandler);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  useEffect(() => {
    const el = outputRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, open]);

  const close = () => {
    setOpen(false);
    restoreRef.current?.focus?.();
  };

  const run = (raw: string) => {
    const input = raw.trim();
    const echo: Line[] = [{ text: `${PROMPT} ${input}` }];
    if (!input) {
      setLines((prev) => [...prev, ...echo]);
      return;
    }

    setHistory((prev) => [...prev, input]);
    setHistoryIndex(-1);

    const [cmd] = input.split(/\s+/);
    const key = cmd.toLowerCase();
    let out: Line[];

    if (/^sudo\s+bobo\s+--unlock-secret$/i.test(input)) {
      window.dispatchEvent(new CustomEvent(HMB_UNLOCK_EVENT));
      out = [
        { text: "Bobo grumbles and hands over root access…", tone: "dim" },
        { text: "Secret boss mission unlocked in Hack My Brain.", tone: "accent" },
      ];
      setLines((prev) => [...prev, ...echo, ...out]);
      setValue("");
      return;
    }

    switch (key) {
      case "help":
        out = [
          { text: "Available commands:", tone: "accent" },
          { text: "  about         who I am" },
          { text: "  projects      featured and practice projects" },
          { text: "  skills        programming, tools, technical areas" },
          { text: "  education     schools and university" },
          { text: "  achievements  certificates and results" },
          { text: "  contact       email, location, and profiles" },
          { text: "  resume        open my CV" },
          { text: "  github        open my GitHub profile" },
          { text: "  linkedin      open my LinkedIn profile" },
          { text: "  date          current date and time" },
          { text: "  whoami        short version" },
          { text: "  clear         clear this screen" },
          { text: "  exit          close the terminal" },
          { text: "" },
          { text: "  pssst… something is hidden behind: sudo bobo --unlock-secret", tone: "dim" },
        ];
        break;

      case "about":
        out = [
          { text: `${CV.name} — ${CV.role}`, tone: "accent" },
          { text: t("about.p1") },
          { text: t("about.p2") },
        ];
        break;

      case "projects":
      case "ls":
        out = [
          { text: "Featured:", tone: "accent" },
          ...PROJECTS.map((p) => ({
            text: `  ${p.id === "smart-crop" ? t("projects.crop.title") : p.id === "dhruva" ? t("projects.dhruva.title") : t("projects.varun.title")}`,
            href: p.links.repo,
          })),
          { text: "Practice:", tone: "accent" },
          ...MINOR_PROJECTS.map((p) => ({
            text: `  ${p.id === "typing-master" ? t("projects.minor.typing") : t("projects.minor.game")} (${p.language})`,
            href: p.repo,
          })),
        ];
        break;

      case "skills":
        out = [
          { text: t("skills.programming") + ":", tone: "accent" },
          { text: `  ${CV.skills.programming.join(", ")}` },
          { text: t("skills.tools") + ":", tone: "accent" },
          { text: `  ${CV.skills.tools.join(", ")}` },
          { text: t("skills.areas") + ":", tone: "accent" },
          { text: `  ${CV.skills.areas.join(", ")}` },
        ];
        break;

      case "education":
        out = CV.education.map((e) => ({
          text: `  ${e.period} — ${e.institution}: ${e.description}`,
        }));
        break;

      case "achievements":
        out = CV.achievements.map((a) => ({
          text: `  ${a.year} — ${a.title}`,
        }));
        break;

      case "contact":
        out = [
          { text: `  email:     ${CV.email}` },
          { text: `  location:  ${CV.location}` },
          { text: `  linkedin:  ${CV.links.linkedin}`, href: CV.links.linkedin },
          { text: `  github:    ${CV.links.github}`, href: CV.links.github },
        ];
        break;

      case "resume":
      case "cv":
        window.open(CV.links.cvFile, "_blank", "noopener,noreferrer");
        out = [{ text: "Opening my CV in a new tab…", tone: "dim" }];
        break;

      case "github":
        window.open(CV.links.github, "_blank", "noopener,noreferrer");
        out = [{ text: "Opening github.com/summonerwalacoder…", tone: "dim" }];
        break;

      case "linkedin":
        window.open(CV.links.linkedin, "_blank", "noopener,noreferrer");
        out = [{ text: "Opening LinkedIn profile…", tone: "dim" }];
        break;

      case "date":
        out = [{ text: new Date().toString() }];
        break;

      case "whoami":
        out = [{ text: `${CV.name} — ${CV.role}` }];
        break;

      case "sudo":
        out = [
          {
            text: "Nice try. Bobo holds root around here, and he only grants it for jokes.",
            tone: "dim",
          },
        ];
        break;

      case "clear":
        setLines([]);
        setValue("");
        return;

      case "exit":
      case "quit":
        out = [{ text: "Closing terminal…", tone: "dim" }];
        setLines((prev) => [...prev, ...echo, ...out]);
        setValue("");
        setTimeout(close, 350);
        return;

      case "":
        out = [];
        break;

      default:
        out = [
          {
            text: `Unknown command "${cmd}". Type "help" to see available commands.`,
            tone: "dim",
          },
        ];
    }

    setLines((prev) => [...prev, ...echo, ...out]);
    setValue("");
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    run(value);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!history.length) return;
      const next = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(next);
      setValue(history[next]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const next = historyIndex + 1;
      if (next >= history.length) {
        setHistoryIndex(-1);
        setValue("");
      } else {
        setHistoryIndex(next);
        setValue(history[next]);
      }
    }
  };

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label={t("ui.terminal")}
      onKeyDown={(e) => {
        if (e.key === "Escape") close();
      }}
      className="fixed bottom-3 start-3 z-[65] w-[min(36rem,calc(100vw-1.5rem))] overflow-hidden rounded-lg border border-white/[0.12] bg-ink-raised/95 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur"
    >
      <div className="flex items-center gap-3 border-b border-white/[0.09] px-4 py-2.5">
        <span aria-hidden="true" className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-frost-600/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-frost-500/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-glacier/60" />
        </span>
        <span className="flex-1 truncate font-mono text-[11px] uppercase tracking-label text-frost-500">
          {t("ui.terminal")}
        </span>
        <button
          type="button"
          onClick={close}
          className="rounded px-2 py-0.5 font-mono text-[11px] text-frost-400 transition-colors hover:bg-white/[0.06] hover:text-frost-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
        >
          esc
        </button>
      </div>

      <div
        ref={outputRef}
        className="h-[min(19rem,55vh)] overflow-y-auto px-4 py-3 font-mono text-[12.5px] leading-relaxed"
        aria-live="polite"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.tone === "accent"
                ? "text-glacier"
                : line.tone === "dim"
                  ? "text-frost-500"
                  : "break-words text-frost-300"
            }
          >
            {line.href ? (
              <a
                href={line.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-underline text-glacier hover:text-frost-100"
              >
                {line.text}
              </a>
            ) : (
              line.text
            )}
          </div>
        ))}
      </div>

      <form
        onSubmit={onSubmit}
        className="flex items-center gap-2 border-t border-white/[0.09] px-4 py-3"
      >
        <label htmlFor="terminal-input" className="shrink-0 font-mono text-[12.5px] text-glacier">
          {PROMPT}
        </label>
        <input
          id="terminal-input"
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
          autoComplete="off"
          spellCheck={false}
          aria-label="Terminal command"
          className="min-w-0 flex-1 bg-transparent font-mono text-[12.5px] text-frost-100 caret-glacier outline-none"
        />
      </form>
    </div>
  );
}
