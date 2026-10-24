"use client";

import { useMemo } from "react";
import { WORLDS, type WorldDef, type WorldId } from "@/data/multiverse";

const MAP = 1000;
const CX = MAP / 2;
const CY = MAP / 2;
const HALF = MAP / 2;

export function worldPos(w: WorldDef): { x: number; y: number } {
  const rad = (w.angle * Math.PI) / 180;
  const r = w.orbit * HALF * 0.82;
  return { x: CX + Math.cos(rad) * r, y: CY + Math.sin(rad) * r };
}

const STARS = (() => {
  const out: { x: number; y: number; r: number; o: number; d: number }[] = [];
  let seed = 42;
  const rand = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };
  for (let i = 0; i < 90; i++) {
    out.push({
      x: rand() * MAP,
      y: rand() * MAP,
      r: 0.6 + rand() * 1.4,
      o: 0.15 + rand() * 0.55,
      d: rand() * 6,
    });
  }
  return out;
})();

export interface CosmicMapProps {
  selected: WorldId | null;
  found: Set<WorldId>;
  revealed: Set<string>;
  reduced: boolean;
  paused: boolean;
  centerActive?: boolean;
  onSelect: (id: WorldId) => void;
  onCenter?: () => void;
  centerName?: string;
  nameFor: (id: WorldId) => string;
  labelFor: (id: WorldId) => string;
}

export function CosmicMap({
  selected,
  found,
  revealed,
  reduced,
  paused,
  centerActive = false,
  onSelect,
  onCenter,
  centerName,
  nameFor,
  labelFor,
}: CosmicMapProps) {
  const positions = useMemo(
    () => WORLDS.map((w) => ({ w, p: worldPos(w) })),
    [],
  );

  const active = selected ?? null;
  const activePos = active
    ? positions.find((x) => x.w.id === active)?.p ?? null
    : null;

  const shift = activePos
    ? { x: (CX - activePos.x) * 0.16, y: (CY - activePos.y) * 0.16 }
    : { x: 0, y: 0 };

  const classes = [
    "mv-map",
    reduced ? "is-reduced" : "",
    paused ? "is-paused" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${MAP} ${MAP}`}
      className={classes}
      role="group"
      aria-label="Cosmic map of my developer journey"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="mv-core-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(156,197,232,0.9)" />
          <stop offset="45%" stopColor="rgba(127,176,255,0.35)" />
          <stop offset="100%" stopColor="rgba(127,176,255,0)" />
        </radialGradient>
        <radialGradient id="mv-core-fill" cx="42%" cy="38%" r="70%">
          <stop offset="0%" stopColor="#eaf3fb" />
          <stop offset="55%" stopColor="#9cc5e8" />
          <stop offset="100%" stopColor="#3a5a8c" />
        </radialGradient>
      </defs>

      <g transform={`translate(${shift.x} ${shift.y})`}>
        {/* star field */}
        <g className="mv-stars">
          {STARS.map((s, i) => (
            <circle
              key={i}
              cx={s.x}
              cy={s.y}
              r={s.r}
              fill="#cfe0f1"
              opacity={s.o}
              className="mv-star"
              style={{ animationDelay: `${s.d}s` }}
            />
          ))}
        </g>

        {/* orbital rings */}
        {[0.42, 0.6, 0.78].map((f, i) => (
          <circle
            key={i}
            cx={CX}
            cy={CY}
            r={f * HALF * 0.82}
            fill="none"
            stroke="rgba(156,197,232,0.1)"
            strokeWidth={1}
            strokeDasharray="2 10"
            className="mv-ring"
          />
        ))}

        {/* luminous paths core -> worlds */}
        {positions.map(({ w, p }) => {
          const isActive = active === w.id;
          const isFound = found.has(w.id);
          return (
            <line
              key={w.id}
              x1={CX}
              y1={CY}
              x2={p.x}
              y2={p.y}
              stroke={w.accent}
              strokeWidth={isActive ? 2.2 : 1}
              opacity={isActive ? 0.85 : isFound ? 0.4 : 0.18}
              className={`mv-path${isActive ? " is-active" : ""}`}
            />
          );
        })}

        {/* central core — the main character */}
        <g
          className={`mv-core${centerActive ? " is-active" : ""}${onCenter ? " is-clickable" : ""}`}
          role={onCenter ? "button" : undefined}
          tabIndex={onCenter ? 0 : undefined}
          aria-label={onCenter ? centerName : undefined}
          aria-pressed={onCenter ? centerActive : undefined}
          onClick={onCenter}
          onKeyDown={
            onCenter
              ? (e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onCenter();
                  }
                }
              : undefined
          }
        >
          <circle cx={CX} cy={CY} r={190} fill="url(#mv-core-glow)" className="mv-core-aura" />
          <circle
            cx={CX}
            cy={CY}
            r={70}
            fill="none"
            stroke="rgba(234,243,251,0.5)"
            strokeWidth={1}
            strokeDasharray="3 6"
            className="mv-core-orbit"
          />
          <circle
            cx={CX}
            cy={CY}
            r={54}
            fill="none"
            stroke="rgba(143,178,255,0.55)"
            strokeWidth={1.2}
            strokeDasharray="1 5"
            className="mv-core-orbit mv-core-orbit-rev"
          />
          <circle cx={CX} cy={CY} r={44} fill="url(#mv-core-fill)" />
          <circle
            cx={CX}
            cy={CY}
            r={44}
            fill="none"
            stroke="rgba(234,243,251,0.85)"
            strokeWidth={centerActive ? 2 : 1}
            className="mv-core-edge"
          />
          <text
            className="mv-core-initials"
            x={CX}
            y={CY}
            textAnchor="middle"
            dominantBaseline="central"
          >
            SK
          </text>
          <text
            className="mv-core-label"
            x={CX}
            y={CY + 84}
            textAnchor="middle"
          >
            {centerName}
          </text>
        </g>

        {/* worlds */}
        {positions.map(({ w, p }) => {
          const isActive = active === w.id;
          const isFound = found.has(w.id);
          const isRevealed = revealed.has(w.id);
          return (
            <g
              key={w.id}
              className={`mv-world${isActive ? " is-active" : ""}${isFound ? " is-found" : ""}`}
              transform={`translate(${p.x} ${p.y})`}
              role="button"
              tabIndex={0}
              aria-label={nameFor(w.id)}
              aria-pressed={isActive}
              onClick={() => onSelect(w.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelect(w.id);
                }
              }}
            >
              <circle
                className="mv-world-halo"
                r={w.size * 0.86}
                fill={`rgba(${w.glow},0.18)`}
                opacity={isActive ? 0.22 : 0.1}
              />
              <circle
                className="mv-world-body"
                r={w.size * 0.42}
                fill={w.accent}
                opacity={isFound ? 0.95 : 0.7}
              />
              <circle
                className="mv-world-ring"
                r={w.size * 0.56}
                fill="none"
                stroke={w.accent}
                strokeWidth={isActive ? 1.6 : 0.9}
                opacity={isActive ? 0.7 : 0.3}
                strokeDasharray={isRevealed ? "none" : "3 7"}
              />
              <circle
                className="mv-world-shine"
                r={w.size * 0.14}
                cx={-w.size * 0.14}
                cy={-w.size * 0.16}
                fill="#eaf3fb"
                opacity={isFound ? 0.6 : 0.25}
              />
              <text
                className="mv-world-label"
                y={w.size * 0.42 + 22}
                textAnchor="middle"
                fill={isActive ? "#eef6ff" : "rgba(207,224,241,0.6)"}
              >
                {labelFor(w.id)}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
