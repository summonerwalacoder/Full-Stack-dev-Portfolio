"use client";

import { useEffect } from "react";
import { useReducedMotion } from "framer-motion";

const SELECTOR = "main h1, main h2, main h3";
const MIN_FONT_PX = 20;

type Target = {
  el: HTMLElement;
  docLeft: number;
  docTop: number;
  width: number;
  height: number;
};

/**
 * Magnifying-glass cursor.
 *
 * Limitation (documented): CSS/JS cannot scale `backdrop-filter`, so a true
 * optical lens over arbitrary page content is not reliably supported. Instead,
 * while the lens is over a major heading, it renders a live DOM clone of that
 * heading, geometrically transformed to appear magnified around the lens
 * centre — genuine magnification of the real text, not a decorative circle.
 * Only one heading is cloned at a time (never the whole page). Everywhere
 * else the lens is a restrained glass cursor. Touch devices and
 * prefers-reduced-motion keep the native cursor.
 */
export function Cursor({
  size = 104,
  magnification = 1.65,
}: {
  size?: number;
  magnification?: number;
}) {
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const R = size / 2;

    const spot = document.createElement("div");
    spot.className = "cursor-spotlight";
    spot.setAttribute("aria-hidden", "true");

    const lens = document.createElement("div");
    lens.className = "cursor-lens";
    lens.setAttribute("aria-hidden", "true");
    lens.style.width = `${size}px`;
    lens.style.height = `${size}px`;

    const layer = document.createElement("div");
    layer.className = "cursor-lens-layer";
    lens.appendChild(layer);
    document.body.append(spot, lens);
    document.documentElement.classList.add("cursor-none");

    let targets: Target[] = [];
    let clone: HTMLElement | null = null;
    let cloneFor: Target | null = null;

    const collect = () => {
      targets = [];
      const nodes = document.querySelectorAll(SELECTOR);
      nodes.forEach((node) => {
        const el = node as HTMLElement;
        const rect = el.getBoundingClientRect();
        if (rect.width < 40 || rect.height < 12) return;
        const fontSize = parseFloat(getComputedStyle(el).fontSize);
        if (!Number.isFinite(fontSize) || fontSize < MIN_FONT_PX) return;
        targets.push({
          el,
          docLeft: rect.left + window.scrollX,
          docTop: rect.top + window.scrollY,
          width: rect.width,
          height: rect.height,
        });
      });
    };

    const detachClone = () => {
      if (clone) {
        clone.remove();
        clone = null;
      }
      cloneFor = null;
    };

    const attachClone = (target: Target) => {
      detachClone();
      clone = target.el.cloneNode(true) as HTMLElement;
      clone.removeAttribute("id");
      clone.setAttribute("aria-hidden", "true");
      clone.style.position = "absolute";
      clone.style.margin = "0";
      clone.style.pointerEvents = "none";
      layer.appendChild(clone);
      cloneFor = target;
    };

    const pickTarget = (x: number, y: number): Target | null => {
      let best: Target | null = null;
      let bestArea = Infinity;
      for (const t of targets) {
        const vx = t.docLeft - window.scrollX;
        const vy = t.docTop - window.scrollY;
        if (
          x >= vx - R - 10 &&
          x <= vx + t.width + R + 10 &&
          y >= vy - R - 10 &&
          y <= vy + t.height + R + 10
        ) {
          const area = t.width * t.height;
          if (area < bestArea) {
            bestArea = area;
            best = t;
          }
        }
      }
      return best;
    };

    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    let lx = px;
    let ly = py;
    let sx = px;
    let sy = py;
    let visible = false;
    let magnifying = false;
    let suppressed = false;
    let frameId = 0;
    let scrollQueued = false;

    const show = () => {
      if (visible) return;
      visible = true;
      lens.classList.add("is-visible");
      spot.classList.add("is-visible");
    };

    const hide = () => {
      visible = false;
      lens.classList.remove("is-visible");
      spot.classList.remove("is-visible");
    };

    const onMove = (e: PointerEvent) => {
      px = e.clientX;
      py = e.clientY;
      show();
    };

    const onOver = (e: PointerEvent) => {
      const target = e.target as Element | null;
      if (!target?.closest) return;
      const inField = Boolean(
        target.closest("input, textarea, [contenteditable='true']")
      );
      if (inField !== suppressed) {
        suppressed = inField;
        lens.classList.toggle("is-suppressed", inField);
      }
      const interactive = Boolean(
        target.closest(
          "a,button,select,summary,[role='button'],[role='option'],[role='menuitem'],[role='dialog']"
        )
      );
      lens.classList.toggle("is-active", interactive);
    };

    const onDown = () => lens.classList.add("is-pressed");
    const onUp = () => lens.classList.remove("is-pressed");
    const onLeave = (e: PointerEvent) => {
      if (!e.relatedTarget) hide();
    };

    const onScroll = () => {
      if (scrollQueued) return;
      scrollQueued = true;
      requestAnimationFrame(() => {
        scrollQueued = false;
        collect();
      });
    };

    const onResize = () => {
      detachClone();
      collect();
    };

    const tick = () => {
      lx += (px - lx) * 0.24;
      ly += (py - ly) * 0.24;
      sx += (px - sx) * 0.055;
      sy += (py - sy) * 0.055;

      spot.style.transform = `translate3d(${sx}px, ${sy}px, 0)`;
      lens.style.transform = `translate3d(${lx - R}px, ${ly - R}px, 0)`;

      const target = suppressed ? null : pickTarget(px, py);

      if (target !== cloneFor) {
        if (target) {
          attachClone(target);
          lens.classList.add("is-magnifying");
          layer.style.opacity = "1";
          magnifying = true;
        } else {
          detachClone();
          lens.classList.remove("is-magnifying");
          layer.style.opacity = "0";
          magnifying = false;
        }
      }

      if (magnifying && cloneFor && clone) {
        const rect = cloneFor.el.getBoundingClientRect();
        clone.style.left = `${rect.left}px`;
        clone.style.top = `${rect.top}px`;
        layer.style.transform = `translate(${R - lx * magnification}px, ${
          R - ly * magnification
        }px) scale(${magnification})`;
      }

      frameId = requestAnimationFrame(tick);
    };

    collect();
    if (typeof document.fonts?.ready?.then === "function") {
      document.fonts.ready.then(collect).catch(() => {});
    }

    let observer: MutationObserver | null = null;
    const main = document.querySelector("main");
    if (main && typeof MutationObserver !== "undefined") {
      observer = new MutationObserver(() => {
        detachClone();
        collect();
      });
      observer.observe(main, {
        childList: true,
        subtree: true,
        characterData: true,
      });
    }

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });
    frameId = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointerout", onLeave);
      observer?.disconnect();
      cancelAnimationFrame(frameId);
      document.documentElement.classList.remove("cursor-none");
      spot.remove();
      lens.remove();
    };
  }, [reduce, size, magnification]);

  return null;
}
