"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { useI18n } from "@/i18n/I18nProvider";
import { SectionShell } from "@/components/SectionShell";
import { Reveal } from "@/components/Reveal";
import { cancelSpeech, speakJoke } from "@/components/bobo/boboAudio";
import { WORLDS, CENTER, CONTACT_ID, type WorldDef, type WorldId } from "@/data/multiverse";
import { CosmicMap } from "./CosmicMap";
import { WorldPanel } from "./WorldPanel";
import { CenterPanel } from "./CenterPanel";
import { MultiverseGuide } from "./MultiverseGuide";

type Phase = "intro" | "explore" | "final";

const SHORT: Record<WorldId, string> = {
  origin: "mv.short.origin",
  skills: "mv.short.skills",
  projects: "mv.short.projects",
  achievements: "mv.short.achievements",
  frontier: "mv.short.frontier",
};

const DISCOVER_MSG: Record<WorldId, string> = {
  origin: "mv.bobo.origin",
  skills: "mv.bobo.skills",
  projects: "mv.bobo.projects",
  achievements: "mv.bobo.achievements",
  frontier: "mv.bobo.frontier",
};

const EASTER_EGGS = [
  { id: "egg1", key: "mv.egg.1", x: 0.16, y: 0.28 },
  { id: "egg2", key: "mv.egg.2", x: 0.84, y: 0.7 },
  { id: "egg3", key: "mv.egg.3", x: 0.5, y: 0.14 },
];

/** Strip decorative glyphs so text-to-speech reads cleanly. */
function cleanForSpeech(text: string): string {
  return text
    .replace(/[\u2600-\u27BF\u2190-\u21FF\u2B00-\u2BFF\uFE0F\u200D]/g, " ")
    .replace(/["""']/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildWorldNarration(t: (k: string) => string, world: WorldDef): string {
  const parts = [
    t(world.nameKey),
    t(world.tagKey),
    t(world.narrativeKey),
    ...world.entries.flatMap((e) => [t(e.titleKey), t(e.detailKey)]),
  ];
  return cleanForSpeech(parts.join(". "));
}

export function DeveloperMultiverse() {
  const { t, locale } = useI18n();
  const reducedPref = useReducedMotion();
  const [motionMode, setMotionMode] = useState<"auto" | "on" | "off">("auto");
  const reduced =
    motionMode === "off" ? true : motionMode === "on" ? false : Boolean(reducedPref);

  const [phase, setPhase] = useState<Phase>("intro");
  const [selected, setSelected] = useState<WorldId | null>(null);
  const [centerOpen, setCenterOpen] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [found, setFound] = useState<Set<WorldId>>(new Set());
  const [eggs, setEggs] = useState<Set<string>>(new Set());
  const [guideKey, setGuideKey] = useState<string | null>("mv.bobo.intro");
  const [guidePulse, setGuidePulse] = useState(0);
  const [muted, setMuted] = useState(true);
  const [listView, setListView] = useState(false);
  const [visible, setVisible] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const lastEgg = useRef<string | null>(null);

  /**
   * Speak a piece of narration. Cancels any narration already in progress so a
   * new click always switches to the new planet mid-sentence.
   */
  const narrate = useCallback(
    (text: string) => {
      cancelSpeech();
      if (muted || typeof window === "undefined" || !("speechSynthesis" in window)) {
        setSpeaking(false);
        return;
      }
      const clean = cleanForSpeech(text);
      if (!clean) return;
      const ok = speakJoke(clean, locale, {
        onStart: () => setSpeaking(true),
        onEnd: () => setSpeaking(false),
      });
      if (!ok) setSpeaking(false);
    },
    [muted, locale],
  );

  // stop narration whenever the user leaves the experience
  useEffect(() => {
    if (phase === "intro") {
      cancelSpeech();
      setSpeaking(false);
    }
  }, [phase]);

  useEffect(() => () => cancelSpeech(), []);

  useEffect(() => {
    try {
      setMuted(localStorage.getItem("sumit.mv.muted") !== "0");
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("sumit.mv.muted", muted ? "0" : "1");
    } catch {
      /* ignore */
    }
  }, [muted]);

  // pause animations when offscreen
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting);
      },
      { threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const say = useCallback((key: string) => {
    setGuideKey(key);
    setGuidePulse((p) => p + 1);
  }, []);

  const discover = useCallback(
    (id: WorldId) => {
      setFound((prev) => {
        if (prev.has(id)) return prev;
        const next = new Set(prev);
        next.add(id);
        say(DISCOVER_MSG[id]);
        return next;
      });
    },
    [say],
  );

  const openWorld = useCallback(
    (id: WorldId) => {
      setCenterOpen(false);
      setSelected(id);
      discover(id);
      const world = WORLDS.find((w) => w.id === id);
      if (world) narrate(buildWorldNarration(t, world));
    },
    [discover, narrate, t],
  );

  const openCenter = useCallback(() => {
    setSelected(null);
    setCenterOpen(true);
    narrate(t(CENTER.introKey));
  }, [narrate, t]);

  const enter = () => {
    setPhase("explore");
    setSelected(null);
    setCenterOpen(false);
    say("mv.bobo.intro");
    window.requestAnimationFrame(() => {
      rootRef.current?.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
    });
  };

  const exitMultiverse = useCallback(() => {
    cancelSpeech();
    setSpeaking(false);
    setSelected(null);
    setCenterOpen(false);
    setPhase("intro");
  }, []);

  const goToContact = () => {
    document.getElementById(CONTACT_ID)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  const triggerEgg = (id: string, key: string) => {
    if (!eggs.has(id)) {
      setEggs((prev) => new Set(prev).add(id));
    }
    lastEgg.current = id;
    say(key);
  };

  const complete = found.size >= WORLDS.length;

  useEffect(() => {
    if (complete && phase === "explore") {
      say("mv.bobo.final");
      const timer = window.setTimeout(() => setPhase("final"), 1200);
      return () => window.clearTimeout(timer);
    }
  }, [complete, phase, say]);

  const motionControls = (
    <div className="mv-toolbar" role="group" aria-label={t("mv.controls")}>
      <button
        type="button"
        className="mv-chip"
        onClick={() => setMuted((m) => !m)}
        aria-pressed={muted}
      >
        {muted ? t("mv.soundOff") : t("mv.soundOn")}
      </button>
      <button
        type="button"
        className="mv-chip"
        onClick={() => setListView((v) => !v)}
        aria-pressed={listView}
      >
        {listView ? t("mv.showUniverse") : t("mv.showList")}
      </button>
      <div className="mv-seg">
        {(["auto", "on", "off"] as const).map((m) => (
          <button
            key={m}
            type="button"
            className={`mv-seg-btn${motionMode === m ? " is-active" : ""}`}
            onClick={() => setMotionMode(m)}
            aria-pressed={motionMode === m}
          >
            {t(`mv.motion.${m}`)}
          </button>
        ))}
      </div>
      <button
        type="button"
        className="mv-chip mv-chip-exit"
        onClick={exitMultiverse}
        aria-label={t("mv.exit.aria")}
      >
        <span aria-hidden="true">×</span> {t("mv.exit")}
      </button>
    </div>
  );

  return (
    <SectionShell
      id="multiverse"
      index="07"
      label={t("mv.label")}
      title={t("mv.title")}
      intro={t("mv.intro")}
    >
      <div ref={rootRef} className="mv-root">
        {/* INTRO */}
        {phase === "intro" && (
          <Reveal>
            <div className="mv-hero">
              <div className={`mv-hero-stage${visible && !reduced ? " is-live" : ""}`}>
                <CosmicMap
                  selected={null}
                  found={new Set()}
                  revealed={new Set()}
                  reduced={reduced}
                  paused={!visible}
                  onSelect={() => undefined}
                  nameFor={(id) => t(WORLDS.find((w) => w.id === id)!.nameKey)}
                  labelFor={(id) => t(SHORT[id])}
                />
              </div>
              <div className="mv-hero-copy">
                <p className="mv-kicker">{t("mv.kicker")}</p>
                <h3 className="mv-hero-title">{t("mv.heroTitle")}</h3>
                <p className="mv-hero-quote">{t("mv.quote")}</p>
                <div className="mv-actions">
                  <button type="button" className="mv-btn mv-btn-primary" onClick={enter}>
                    {t("mv.enter")}
                  </button>
                  <button type="button" className="mv-btn mv-btn-ghost" onClick={goToContact}>
                    {t("mv.skip")}
                  </button>
                </div>
              </div>
            </div>
          </Reveal>
        )}

        {/* EXPLORE */}
        {phase !== "intro" && (
          <>
            <div className="mv-bar">
              <span className="mv-progress">
                {t("mv.signals")}: <strong>{found.size}</strong> / {WORLDS.length}
              </span>
              {motionControls}
            </div>

            {listView ? (
              <ul className="mv-alt-list">
                {WORLDS.map((w) => (
                  <li key={w.id} className="mv-alt-item">
                    <button
                      type="button"
                      className="mv-alt-btn"
                      onClick={() => {
                        openWorld(w.id);
                        setListView(false);
                      }}
                    >
                      <span className="mv-alt-name" style={{ color: w.accent }}>
                        {t(w.nameKey)}
                      </span>
                      <span className="mv-alt-tag">{t(w.tagKey)}</span>
                      {found.has(w.id) && (
                        <span className="mv-alt-found" aria-label={t("mv.discovered")}>
                          ✓
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className={`mv-stage${visible && !reduced ? " is-live" : ""}`}>
                <CosmicMap
                  selected={selected}
                  found={found}
                  revealed={new Set()}
                  reduced={reduced}
                  paused={!visible}
                  centerActive={centerOpen}
                  onSelect={openWorld}
                  onCenter={openCenter}
                  centerName={t(CENTER.nameKey)}
                  nameFor={(id) => t(WORLDS.find((w) => w.id === id)!.nameKey)}
                  labelFor={(id) => t(SHORT[id])}
                />

                {/* easter eggs */}
                {EGGS_POS.map((egg, i) => (
                  <button
                    key={egg.id}
                    type="button"
                    className={`mv-egg${eggs.has(egg.id) ? " is-found" : ""}`}
                    style={{ left: `${egg.x * 100}%`, top: `${egg.y * 100}%` }}
                    onClick={() => triggerEgg(egg.id, egg.key)}
                    aria-label={t("mv.egg.aria")}
                    title={t("mv.egg.aria")}
                  >
                    <span aria-hidden="true">✦</span>
                    <span className="sr-only">{i + 1}</span>
                  </button>
                ))}

                {selected && (
                  <WorldPanel
                    world={WORLDS.find((w) => w.id === selected)!}
                    discovered={found.has(selected)}
                    onClose={() => {
                      setSelected(null);
                      cancelSpeech();
                      setSpeaking(false);
                    }}
                  />
                )}

                {centerOpen && (
                  <CenterPanel
                    speaking={speaking}
                    onClose={() => {
                      cancelSpeech();
                      setSpeaking(false);
                      setCenterOpen(false);
                    }}
                  />
                )}
              </div>
            )}

            <MultiverseGuide
              messageKey={guideKey}
              pulse={guidePulse}
              muted
              reduced={reduced}
            />
          </>
        )}

        {/* FINAL */}
        {phase === "final" && (
          <Reveal>
            <div className="mv-final">
              <p className="mv-final-kicker">{t("mv.final.kicker")}</p>
              <h3 className="mv-final-title">{t("mv.final.title")}</h3>
              <p className="mv-final-quote">{t("mv.final.quote")}</p>
              <div className="mv-actions">
                <button type="button" className="mv-btn mv-btn-primary" onClick={goToContact}>
                  {t("mv.final.connect")}
                </button>
              </div>
              <p className="mv-final-note">{t("mv.final.note")}</p>
            </div>
          </Reveal>
        )}
      </div>
    </SectionShell>
  );
}

/** easter egg positions come from the shared list above */
const EGGS_POS = EASTER_EGGS;
