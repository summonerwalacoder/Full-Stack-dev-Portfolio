"use client";

import { forwardRef } from "react";

export type BoboMode = "walk" | "talk" | "laugh" | "wave" | "sleep" | "wake";

export const BoboCharacter = forwardRef<
  SVGSVGElement,
  {
    mode: BoboMode;
    mouth: number;
    pupilX: number;
    pupilY: number;
    listening: boolean;
  }
>(function BoboCharacter({ mode, mouth, pupilX, pupilY, listening }, ref) {
  const closed = mode === "sleep";
  const open = Math.max(0.12, mouth);

  return (
    <svg
      ref={ref}
      viewBox="0 0 80 104"
      width="100%"
      height="100%"
      aria-hidden="true"
      className={`bobo-char bobo-mode-${mode}${listening ? " bobo-listening" : ""}`}
    >
      <g className="bobo-body">
        <g className="bobo-antenna">
          <line
            x1="40"
            y1="14"
            x2="40"
            y2="5"
            stroke="rgba(156,197,232,0.7)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="40" cy="4" r="3" fill="#9cc5e8" className="bobo-tip" />
        </g>

        <g className="bobo-head">
          <rect
            x="12"
            y="14"
            width="56"
            height="42"
            rx="16"
            fill="#0e1524"
            stroke="rgba(156,197,232,0.5)"
            strokeWidth="1.6"
          />
          <rect
            x="18"
            y="20"
            width="44"
            height="30"
            rx="12"
            fill="#0a0f1c"
            stroke="rgba(156,197,232,0.18)"
            strokeWidth="1"
          />
          <g className="bobo-brows" aria-hidden="true">
            <path
              d="M25.5 25.5 Q31 22.6 36.5 24.6"
              fill="none"
              stroke="rgba(156,197,232,0.65)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
            <path
              d="M43.5 24.6 Q49 22.6 54.5 25.5"
              fill="none"
              stroke="rgba(156,197,232,0.65)"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </g>
          <g className={`bobo-eyes${closed ? " bobo-eyes-closed" : ""}`}>
            <circle cx="31" cy="33" r="6" fill="#9cc5e8" />
            <circle cx="49" cy="33" r="6" fill="#9cc5e8" />
            <circle
              cx={31 + pupilX}
              cy={33 + pupilY}
              r="2.6"
              fill="#0a0f1c"
            />
            <circle
              cx={49 + pupilX}
              cy={33 + pupilY}
              r="2.6"
              fill="#0a0f1c"
            />
            <circle
              cx={32.4 + pupilX}
              cy={31.6 + pupilY}
              r="1"
              fill="#eaf3fb"
            />
            <circle
              cx={50.4 + pupilX}
              cy={31.6 + pupilY}
              r="1"
              fill="#eaf3fb"
            />
          </g>
          <g className="bobo-mouth" style={{ transform: `scaleY(${open})` }}>
            <ellipse cx="40" cy="45" rx="6.5" ry="4" fill="#05080f" />
            <ellipse cx="40" cy="46.4" rx="3.4" ry="1.6" fill="#9cc5e8" opacity="0.55" />
          </g>
          <path
            d="M27 44.5c3 3.4 23 3.4 26 0"
            fill="none"
            stroke="rgba(156,197,232,0.4)"
            strokeWidth="1.2"
            strokeLinecap="round"
            opacity={open > 0.4 ? 0 : 1}
          />
          <rect
            x="6"
            y="30"
            width="5"
            height="10"
            rx="2.5"
            fill="#0e1524"
            stroke="rgba(156,197,232,0.35)"
            strokeWidth="1"
          />
          <rect
            x="69"
            y="30"
            width="5"
            height="10"
            rx="2.5"
            fill="#0e1524"
            stroke="rgba(156,197,232,0.35)"
            strokeWidth="1"
          />
        </g>

        <rect
          x="36"
          y="55"
          width="8"
          height="7"
          rx="3"
          fill="#0e1524"
          stroke="rgba(156,197,232,0.35)"
          strokeWidth="1"
        />

        <g className="bobo-torso">
          <rect
            x="20"
            y="60"
            width="40"
            height="24"
            rx="10"
            fill="#0e1524"
            stroke="rgba(156,197,232,0.45)"
            strokeWidth="1.4"
          />
          <rect
            x="28"
            y="65"
            width="24"
            height="14"
            rx="6"
            fill="#0a0f1c"
            stroke="rgba(156,197,232,0.2)"
            strokeWidth="1"
          />
          <circle cx="40" cy="72" r="4" fill="#9cc5e8" className="bobo-chest" />
          <circle cx="40" cy="72" r="1.8" fill="#eaf3fb" />
        </g>

        <g className="bobo-arm bobo-arm-l">
          <circle cx="21" cy="64" r="3.4" fill="#0e1524" stroke="rgba(156,197,232,0.4)" strokeWidth="1" />
          <rect x="10" y="66" width="7" height="14" rx="3.5" fill="#0e1524" stroke="rgba(156,197,232,0.4)" strokeWidth="1" />
          <circle cx="13.5" cy="82" r="2.6" fill="#0e1524" stroke="rgba(156,197,232,0.4)" strokeWidth="1" />
          <g className="bobo-hand">
            <rect x="9.5" y="84" width="8" height="7" rx="3" fill="#131c2e" stroke="rgba(156,197,232,0.45)" strokeWidth="1" />
            <line x1="11" y1="91" x2="11" y2="94" stroke="rgba(156,197,232,0.55)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="13.5" y1="91" x2="13.5" y2="94.5" stroke="rgba(156,197,232,0.55)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="16" y1="91" x2="16" y2="94" stroke="rgba(156,197,232,0.55)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="8.6" y1="86.5" x2="6.6" y2="88.5" stroke="rgba(156,197,232,0.55)" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </g>

        <g className="bobo-arm bobo-arm-r">
          <circle cx="59" cy="64" r="3.4" fill="#0e1524" stroke="rgba(156,197,232,0.4)" strokeWidth="1" />
          <rect x="63" y="66" width="7" height="14" rx="3.5" fill="#0e1524" stroke="rgba(156,197,232,0.4)" strokeWidth="1" />
          <circle cx="66.5" cy="82" r="2.6" fill="#0e1524" stroke="rgba(156,197,232,0.4)" strokeWidth="1" />
          <g className="bobo-hand">
            <rect x="62.5" y="84" width="8" height="7" rx="3" fill="#131c2e" stroke="rgba(156,197,232,0.45)" strokeWidth="1" />
            <line x1="64" y1="91" x2="64" y2="94" stroke="rgba(156,197,232,0.55)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="66.5" y1="91" x2="66.5" y2="94.5" stroke="rgba(156,197,232,0.55)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="69" y1="91" x2="69" y2="94" stroke="rgba(156,197,232,0.55)" strokeWidth="1.4" strokeLinecap="round" />
            <line x1="71.4" y1="86.5" x2="73.4" y2="88.5" stroke="rgba(156,197,232,0.55)" strokeWidth="1.4" strokeLinecap="round" />
          </g>
        </g>

        <g className="bobo-leg bobo-leg-l">
          <rect x="26" y="83" width="7" height="10" rx="3.5" fill="#0e1524" stroke="rgba(156,197,232,0.4)" strokeWidth="1" />
          <circle cx="29.5" cy="93" r="2.4" fill="#0e1524" stroke="rgba(156,197,232,0.35)" strokeWidth="0.9" />
          <rect x="26.5" y="95" width="7" height="7" rx="2.6" fill="#131c2e" stroke="rgba(156,197,232,0.45)" strokeWidth="1" />
        </g>
        <g className="bobo-leg bobo-leg-r">
          <rect x="47" y="83" width="7" height="10" rx="3.5" fill="#0e1524" stroke="rgba(156,197,232,0.4)" strokeWidth="1" />
          <circle cx="50.5" cy="93" r="2.4" fill="#0e1524" stroke="rgba(156,197,232,0.35)" strokeWidth="0.9" />
          <rect x="46.5" y="95" width="7" height="7" rx="2.6" fill="#131c2e" stroke="rgba(156,197,232,0.45)" strokeWidth="1" />
        </g>
      </g>
    </svg>
  );
});
