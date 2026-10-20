"use client";

import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionShell({
  id,
  index,
  label,
  title,
  intro,
  children,
}: {
  id: string;
  index: string;
  label: string;
  title: string;
  intro?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="mx-auto max-w-shell scroll-mt-20 px-5 py-24 md:px-8 md:py-32"
    >
      <Reveal>
        <div className="flex items-baseline gap-4 border-t border-white/[0.09] pt-6">
          <span className="font-mono text-[11px] text-glacier/70">{index}</span>
          <span className="text-[11px] uppercase tracking-label text-frost-500">
            {label}
          </span>
        </div>
        <h2
          id={`${id}-title`}
          className="mt-6 max-w-2xl font-display text-[clamp(1.9rem,4.5vw,3rem)] font-light leading-[1.12] tracking-[-0.015em] text-frost-50"
        >
          {title}
        </h2>
        {intro && (
          <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-frost-400">
            {intro}
          </p>
        )}
      </Reveal>
      <div className="mt-12 md:mt-16">{children}</div>
    </section>
  );
}
