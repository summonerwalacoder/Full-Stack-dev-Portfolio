"use client";

export function HeadphoneGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M4 12V10a6 6 0 0 1 12 0v2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <rect
        x="2.6"
        y="11"
        width="3.4"
        height="5.2"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="14"
        y="11"
        width="3.4"
        height="5.2"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

export function EqualizerGlyph({ active }: { active: boolean }) {
  return (
    <span
      className={`cheer-eq${active ? " is-live" : ""}`}
      aria-hidden="true"
    >
      <i />
      <i />
      <i />
    </span>
  );
}
