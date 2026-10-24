"use client";

export function FlameGlyph({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} aria-hidden="true">
      <path
        d="M10 2.2c.9 2 2.9 3 3.7 5 .5 1.2.3 2.4-.6 3.2.5-.1 1-.5 1.3-1.1.9 1.4 1.3 2.9 1.1 4.3-.3 2.2-2.2 3.9-4.9 4.3-2.7.4-5.2-1-5.8-3.3-.4-1.5 0-3 .9-4.3.4-.6.9-1.1 1.5-1.5-.2.6-.2 1.2.1 1.7.5-.7.9-1.5 1.1-2.4.4-1.9.5-4.1 1.6-5.9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M10 16.4c-1.2 0-2.1-.8-2.2-1.9-.1-1 .7-2 1.4-3 .3.5.6 1 1 1.4.4-.4.8-.9 1-1.5.6.9 1.1 2 .9 3-.1 1.2-1 2-2.1 2Z"
        fill="currentColor"
        opacity="0.85"
      />
    </svg>
  );
}

export function FireEqualizer({ active }: { active: boolean }) {
  return (
    <span className={`fire-eq${active ? " is-live" : ""}`} aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}
