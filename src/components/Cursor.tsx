"use client";

import { useEffect } from "react";

export function Cursor({ size = 104 }: { size?: number }) {
  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const radius = size / 2;
    const cursor = document.createElement("div");
    cursor.className = "cursor-lens";
    cursor.setAttribute("aria-hidden", "true");
    cursor.style.width = `${size}px`;
    cursor.style.height = `${size}px`;
    const zoomClip = document.createElement("div");
    zoomClip.className = "cursor-zoom-clip";
    zoomClip.setAttribute("aria-hidden", "true");
    cursor.append(zoomClip);
    document.body.append(cursor);

    let visible = false;
    let activeHeading: HTMLElement | null = null;
    let zoomCopy: HTMLElement | null = null;
    let previousMaskStyles: Map<string, { value: string; priority: string }> | null =
      null;
    const maskProperties = [
      "--cursor-zoom-x",
      "--cursor-zoom-y",
      "--cursor-lens-radius",
    ];
    const clearHeadingZoom = () => {
      if (activeHeading) {
        activeHeading.classList.remove("cursor-heading-zoom");
        for (const property of maskProperties) {
          const previous = previousMaskStyles?.get(property);
          if (previous?.value) {
            activeHeading.style.setProperty(
              property,
              previous.value,
              previous.priority
            );
          } else {
            activeHeading.style.removeProperty(property);
          }
        }
      }
      activeHeading = null;
      zoomCopy = null;
      previousMaskStyles = null;
      zoomClip.replaceChildren();
    };
    const updateHeadingZoom = (event: PointerEvent) => {
      const target = document
        .elementFromPoint(event.clientX, event.clientY)
        ?.closest<HTMLElement>("h1, h2, h3, h4");

      if (target !== activeHeading) {
        clearHeadingZoom();
      }
      if (target && target !== activeHeading) {
        activeHeading = target;
        previousMaskStyles = new Map(
          maskProperties.map((property) => [
            property,
            {
              value: target.style.getPropertyValue(property),
              priority: target.style.getPropertyPriority(property),
            },
          ])
        );
        zoomCopy = target.cloneNode(true) as HTMLElement;
        zoomCopy.removeAttribute("id");
        zoomCopy.querySelectorAll("[id]").forEach((element) => {
          element.removeAttribute("id");
        });
        zoomCopy.style.position = "absolute";
        zoomCopy.style.boxSizing = "border-box";
        zoomCopy.style.maxWidth = "none";
        zoomCopy.style.margin = "0";
        zoomClip.replaceChildren(zoomCopy);
        target.classList.add("cursor-heading-zoom");
      }

      if (!target || !activeHeading || !zoomCopy) return;
      const rect = target.getBoundingClientRect();
      const localX = event.clientX - rect.left;
      const localY = event.clientY - rect.top;
      target.style.setProperty("--cursor-zoom-x", `${localX}px`);
      target.style.setProperty("--cursor-zoom-y", `${localY}px`);
      target.style.setProperty("--cursor-lens-radius", `${radius}px`);
      zoomCopy.style.width = `${rect.width}px`;
      zoomCopy.style.height = `${rect.height}px`;
      zoomCopy.style.left = `${rect.left - event.clientX + radius}px`;
      zoomCopy.style.top = `${rect.top - event.clientY + radius}px`;
      zoomCopy.style.transform = "scale(1.35)";
      zoomCopy.style.transformOrigin = `${localX}px ${localY}px`;
    };
    const positionCursor = (event: PointerEvent) => {
      cursor.style.transform = `translate3d(${event.clientX - radius}px, ${
        event.clientY - radius
      }px, 0)`;
      if (!visible) {
        visible = true;
        cursor.classList.add("is-visible");
        document.documentElement.classList.add("cursor-none");
      }
    };
    const onMove = (event: PointerEvent) => {
      positionCursor(event);
      updateHeadingZoom(event);
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target as Element | null;
      if (!target?.closest) return;
      positionCursor(event);
      updateHeadingZoom(event);
      cursor.classList.toggle(
        "is-suppressed",
        Boolean(target.closest("input, textarea, [contenteditable='true']"))
      );
      cursor.classList.toggle(
        "is-active",
        Boolean(
          target.closest(
            "a,button,select,summary,[role='button'],[role='option'],[role='menuitem'],[role='dialog']"
          )
        )
      );
    };

    const onDown = () => cursor.classList.add("is-pressed");
    const onUp = () => cursor.classList.remove("is-pressed");
    const onLeave = (event: PointerEvent) => {
      if (!event.relatedTarget) {
        visible = false;
        cursor.classList.remove("is-visible");
        clearHeadingZoom();
      }
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.addEventListener("pointerout", onLeave, { passive: true });

    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      document.removeEventListener("pointerout", onLeave);
      clearHeadingZoom();
      document.documentElement.classList.remove("cursor-none");
      cursor.remove();
    };
  }, [size]);

  return null;
}
