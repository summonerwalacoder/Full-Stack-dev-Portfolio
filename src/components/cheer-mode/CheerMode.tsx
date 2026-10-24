"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { CheerButton } from "./CheerButton";
import { CheerPanel } from "./CheerPanel";
import {
  CHEER_CLOSE_EVENT,
  CHEER_OPEN_EVENT,
  CHEER_PLAY_EVENT,
} from "./cheerEvents";
import { FIRE_CLOSE_EVENT } from "@/components/fire-mode/fireEvents";

export function CheerMode() {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [suspended, setSuspended] = useState(false);
  const [playRequest, setPlayRequest] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const openPanel = useCallback(() => {
    restoreRef.current = document.activeElement as HTMLElement | null;
    setOpen(true);
    setSuspended(false);
    // Cheer Mode takes over: ask Fire Mode to close and pause. Defer so the
    // other mode's setState never runs during this component's render/update.
    window.setTimeout(() => {
      window.dispatchEvent(new CustomEvent(FIRE_CLOSE_EVENT));
    }, 0);
  }, []);

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

  useEffect(() => {
    window.addEventListener(CHEER_OPEN_EVENT, openPanel);
    return () => window.removeEventListener(CHEER_OPEN_EVENT, openPanel);
  }, [openPanel]);

  // A recommendation (or any external caller) asked to play a specific track:
  // open the panel and hand the request to the catalogue browser.
  useEffect(() => {
    const onPlay = (e: Event) => {
      const trackId = (e as CustomEvent<{ trackId?: string }>).detail?.trackId;
      if (!trackId) return;
      openPanel();
      setPlayRequest(trackId);
    };
    window.addEventListener(CHEER_PLAY_EVENT, onPlay);
    return () => window.removeEventListener(CHEER_PLAY_EVENT, onPlay);
  }, [openPanel]);

  // Fire Mode opening suspends Cheer Mode without unmounting the player.
  useEffect(() => {
    const onSuspend = () => {
      setOpen(false);
      setSuspended(true);
    };
    window.addEventListener(CHEER_CLOSE_EVENT, onSuspend);
    return () => window.removeEventListener(CHEER_CLOSE_EVENT, onSuspend);
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

  if (!mounted) return null;

  return (
    <div ref={rootRef} className="cheer-root">
      <CheerButton
        ref={buttonRef}
        open={open}
        active={open}
        background={!open && suspended}
        onClick={toggle}
      />
      <div className={reduced ? "is-reduced" : undefined}>
        <CheerPanel
          open={open}
          suspended={suspended}
          onClose={closePanel}
          playRequest={playRequest}
          onPlayRequestHandled={() => setPlayRequest(null)}
        />
      </div>
    </div>
  );
}
