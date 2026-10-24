"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { DEFAULT_FIRE_SET, FIRE_SETS, type FireSetId } from "@/data/fireMode";
import { FireButton } from "./FireButton";
import { FirePanel } from "./FirePanel";
import { FIRE_CLOSE_EVENT, FIRE_OPEN_EVENT, FIRE_SET_KEY } from "./fireEvents";
import { CHEER_CLOSE_EVENT } from "@/components/cheer-mode/cheerEvents";
import { useMusic } from "@/components/music/MusicProvider";

function isValidSet(v: string | null): v is FireSetId {
  return (
    v === "extreme" ||
    v === "brazilian" ||
    v === "drift" ||
    v === "gym" ||
    v === "viral"
  );
}

export function FireMode() {
  const reduced = useReducedMotion();
  const { pause } = useMusic();
  const [open, setOpen] = useState(false);
  const [setId, setSetId] = useState<FireSetId | null>(null);
  const [suspended, setSuspended] = useState(false);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem(FIRE_SET_KEY);
      if (isValidSet(saved)) setSetId(saved);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      if (setId) localStorage.setItem(FIRE_SET_KEY, setId);
    } catch {
      /* ignore */
    }
  }, [setId]);

  const openPanel = useCallback(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    setSuspended(false);
    pause();
    // Fire Mode takes over: ask Cheer Mode to close and pause. Defer so the
    // other mode's setState never runs during this component's render/update.
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(CHEER_CLOSE_EVENT));
    }, 0);
  }, [pause]);

  const closePanel = useCallback(() => {
    setOpen(false);
    window.requestAnimationFrame(() => {
      const target = restoreRef.current;
      if (target && document.contains(target)) target.focus?.();
      else buttonRef.current?.focus();
    });
  }, []);

  const toggle = useCallback(() => {
    if (!open) {
      openPanel();
      return;
    }
    closePanel();
  }, [open, openPanel, closePanel]);

  const selectSet = useCallback((id: FireSetId) => {
    setSetId(id);
    setSuspended(false);
  }, []);

  useEffect(() => {
    window.addEventListener(FIRE_OPEN_EVENT, openPanel);
    return () => window.removeEventListener(FIRE_OPEN_EVENT, openPanel);
  }, [openPanel]);

  // Cheer Mode opening suspends Fire Mode without unmounting the player.
  useEffect(() => {
    const onSuspend = () => {
      setOpen(false);
      setSuspended(true);
    };
    window.addEventListener(FIRE_CLOSE_EVENT, onSuspend);
    return () => window.removeEventListener(FIRE_CLOSE_EVENT, onSuspend);
  }, []);

  // click outside closes the panel
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      const el = rootRef.current;
      if (el && !el.contains(e.target as Node)) closePanel();
    };
    document.addEventListener("pointerdown", onDown, { passive: true });
    return () => document.removeEventListener("pointerdown", onDown);
  }, [open, closePanel]);

  const set = setId ? FIRE_SETS.find((s) => s.id === setId) ?? null : null;

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="fire-root">
      <FireButton
        ref={buttonRef}
        open={open}
        active={open}
        background={Boolean(set) && !open && suspended}
        onClick={toggle}
      />
      <div className={reduced ? "is-reduced" : undefined}>
        <FirePanel
          open={open}
          set={set}
          setId={setId}
          suspended={suspended}
          onSelectSet={selectSet}
          onClose={closePanel}
        />
      </div>
    </div>
  );
}

export { DEFAULT_FIRE_SET };
