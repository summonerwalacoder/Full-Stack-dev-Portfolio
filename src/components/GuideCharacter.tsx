"use client";

export function GuideCharacter({
  speaking,
  size = 96,
}: {
  speaking: boolean;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 120 120"
      width={size}
      height={size}
      className={speaking ? "guide-speaking" : undefined}
      aria-hidden="true"
      focusable="false"
    >
      <g className="guide-body">
        <g className="guide-antenna">
          <path
            d="M60 34V22"
            stroke="rgba(156,197,232,0.75)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="60" cy="19" r="3.4" fill="#9CC5E8" />
        </g>

        <rect
          x="28"
          y="34"
          width="64"
          height="58"
          rx="22"
          fill="#131C2E"
          stroke="rgba(156,197,232,0.45)"
          strokeWidth="1.6"
        />

        <g className="guide-eyes">
          <ellipse cx="47" cy="58" rx="5.2" ry="6" fill="#E4EBF4" />
          <ellipse cx="73" cy="58" rx="5.2" ry="6" fill="#E4EBF4" />
          <circle cx="47.8" cy="58.6" r="2.2" fill="#0A0F1C" />
          <circle cx="73.8" cy="58.6" r="2.2" fill="#0A0F1C" />
        </g>

        <ellipse
          className="guide-mouth"
          cx="60"
          cy="74"
          rx="7.5"
          ry="2.6"
          fill="#0A0F1C"
          opacity="0.85"
        />

        <path
          d="M36 92c0 6 4 10 10 10h28c6 0 10-4 10-10"
          fill="none"
          stroke="rgba(156,197,232,0.28)"
          strokeWidth="1.4"
        />
        <rect x="42" y="92" width="12" height="6" rx="3" fill="#0E1524" stroke="rgba(156,197,232,0.3)" strokeWidth="1.2" />
        <rect x="66" y="92" width="12" height="6" rx="3" fill="#0E1524" stroke="rgba(156,197,232,0.3)" strokeWidth="1.2" />
      </g>
    </svg>
  );
}
