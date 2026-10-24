"use client";

import { useCallback, useEffect, useRef } from "react";

const LOOP_MS = 36000;

function pointOnRect(t: number, w: number, h: number, m: number) {
  const tw = Math.max(w - 2 * m, 1);
  const th = Math.max(h - 2 * m, 1);
  const total = 2 * (tw + th);
  let s = t * total;
  if (s < tw) return { x: m + s, y: m, dx: 1, dy: 0 };
  s -= tw;
  if (s < th) return { x: w - m, y: m + s, dx: 0, dy: 1 };
  s -= th;
  if (s < tw) return { x: w - m - s, y: h - m, dx: -1, dy: 0 };
  s -= tw;
  return { x: m, y: h - m - s, dx: 0, dy: -1 };
}

export function usePerimeterWalk(
  elRef: React.RefObject<HTMLElement | null>,
  enabled: boolean,
  sizeW: number,
  sizeH: number,
  reduced: boolean
) {
  const pos = useRef({ x: 0, y: 0 });
  const paused = useRef(false);

  const setPaused = useCallback((p: boolean) => {
    paused.current = p;
  }, []);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    if (!enabled || reduced) {
      const parkX = window.innerWidth - sizeW - 16;
      const parkY = window.innerHeight - sizeH - 24;
      el.style.transform = `translate3d(${parkX}px, ${parkY}px, 0)`;
      pos.current.x = parkX + sizeW / 2;
      pos.current.y = parkY + sizeH / 2;
      return;
    }

    let raf = 0;
    let last = performance.now();
    let progress = 0;
    let svx = 1;
    let svy = 0;

    const loop = (now: number) => {
      const dt = Math.min(now - last, 50);
      last = now;
      if (!paused.current) {
        progress = (progress + dt / LOOP_MS) % 1;
      }
      const w = window.innerWidth;
      const h = window.innerHeight;
      const m = sizeW * 0.55 + 12;
      const p = pointOnRect(progress, w, h, m);
      svx += (p.dx - svx) * 0.1;
      svy += (p.dy - svy) * 0.1;
      const len = Math.hypot(svx, svy) || 1;
      const ax = svx / len;
      const ay = svy / len;
      let angle = (Math.atan2(ay, ax) * 180) / Math.PI;
      let flip = 1;
      if (angle > 90 || angle < -90) {
        flip = -1;
        angle += angle > 0 ? -180 : 180;
      }
      const tx = p.x - sizeW / 2;
      const ty = p.y - sizeH / 2;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0) rotate(${angle}deg) scale(${flip}, 1)`;
      pos.current.x = p.x;
      pos.current.y = p.y;
      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [elRef, enabled, sizeW, sizeH, reduced]);

  return { pos, setPaused };
}
