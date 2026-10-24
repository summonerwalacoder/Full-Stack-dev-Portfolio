"use client";

import { useEffect, useRef } from "react";

type Stream = {
  x: number;
  y: number;
  speed: number;
  length: number;
  size: number;
  glyphs: string[];
  phase: number;
};

const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

export function MatrixRain() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d", { alpha: false });
    if (!canvas || !context) {
      console.error("MatrixRain: Canvas 2D is unavailable.");
      return;
    }

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const streams: Stream[] = [];
    let width = 0;
    let height = 0;
    let ratio = 1;
    let frame = 0;
    let lastFrame = 0;
    let disposed = false;

    const draw = () => {
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
      context.fillStyle = "#020b07";
      context.fillRect(0, 0, width, height);

      for (const stream of streams) {
        const rowHeight = stream.size * 1.42;
        const headRow = Math.floor(stream.y);
        context.font = `${stream.size}px "Geist Mono", ui-monospace, monospace`;
        context.textAlign = "center";
        context.textBaseline = "top";

        for (let index = stream.length - 1; index >= 0; index -= 1) {
          const row = headRow - index;
          const y = (stream.y - index) * rowHeight;
          if (y < -rowHeight || y > height) continue;

          const distance = index / stream.length;
          const alpha = (0.12 + (1 - distance) * 0.24) * stream.phase;
          context.globalAlpha = alpha;
          context.fillStyle = distance < 0.12 ? "#9cff72" : "#37c851";
          context.fillText(stream.glyphs[Math.abs(row) % stream.glyphs.length], stream.x, y);
        }

        const headY = stream.y * rowHeight;
        if (headY >= -rowHeight && headY <= height) {
          context.globalAlpha = 0.7 * stream.phase;
          context.fillStyle = "#b5ff8c";
          context.shadowColor = "#40ff58";
          context.shadowBlur = stream.size * 0.8;
          context.fillText(
            stream.glyphs[Math.abs(headRow) % stream.glyphs.length],
            stream.x,
            headY
          );
          context.shadowBlur = 0;
        }
      }
      context.globalAlpha = 1;
    };

    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      const mobile = width < 640;
      ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.15 : 1.5);
      canvas.width = Math.round(width * ratio);
      canvas.height = Math.round(height * ratio);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const size = mobile ? 12 : 15;
      const columnGap = mobile ? 30 : 27;
      const count = Math.ceil(width / columnGap);
      streams.length = 0;
      for (let index = 0; index < count; index += 1) {
        const streamSize = size * randomBetween(0.78, 1.18);
        const length = Math.round(randomBetween(7, mobile ? 16 : 22));
        const glyphs = Array.from({ length: 32 }, () => (Math.random() < 0.5 ? "0" : "1"));
        streams.push({
          x: index * columnGap + randomBetween(-4, 4),
          y: randomBetween(-length, height / (streamSize * 1.42)),
          speed: randomBetween(0.035, 0.11),
          length,
          size: streamSize,
          glyphs,
          phase: randomBetween(0.55, 1),
        });
      }
      draw();
      if (!reduceMotion) {
        lastFrame = 0;
        wake();
      }
    };

    const animate = (timestamp: number) => {
      frame = 0;
      if (disposed || document.hidden) return;
      if (lastFrame && timestamp - lastFrame < 1000 / 30) {
        wake();
        return;
      }
      const delta = lastFrame ? Math.min((timestamp - lastFrame) / 16.67, 2) : 1;
      lastFrame = timestamp;

      for (const stream of streams) {
        stream.y += stream.speed * delta;
        if (stream.y - stream.length > height / (stream.size * 1.42)) {
          stream.y = randomBetween(-stream.length * 1.4, -1);
          stream.length = Math.round(randomBetween(7, width < 640 ? 16 : 22));
          stream.phase = randomBetween(0.55, 1);
        }
        if (Math.random() < 0.012) {
          const glyphIndex = Math.floor(Math.random() * stream.glyphs.length);
          stream.glyphs[glyphIndex] = stream.glyphs[glyphIndex] === "0" ? "1" : "0";
        }
      }

      draw();
      wake();
    };

    function wake() {
      if (!frame && !disposed && !document.hidden && !reduceMotion) {
        frame = requestAnimationFrame(animate);
      }
    }

    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(frame);
        frame = 0;
      } else {
        lastFrame = 0;
        wake();
      }
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("orientationchange", resize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    resize();

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resize);
      window.removeEventListener("orientationchange", resize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="matrix-rain-background"
      aria-hidden="true"
    />
  );
}
