"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { CV } from "@/data/cv";
import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { Quip } from "./Quip";

const CHRONOLOGICAL = ["aps", "jkg", "invertis"];

export function Journey() {
  const { t } = useI18n();

  const entries = CHRONOLOGICAL.map(
    (id) => CV.education.find((e) => e.id === id)!
  );

  const desc = (id: string) => {
    if (id === "invertis") return t("journey.edu1");
    if (id === "aps") return t("journey.edu2");
    return t("journey.edu3");
  };

  return (
    <SectionShell
      id="journey"
      index="04"
      label={t("journey.label")}
      title={t("journey.title")}
      intro={t("journey.intro")}
    >
      <ol className="relative ms-1 border-s border-white/[0.09] ps-8 md:ms-2 md:ps-10">
        {entries.map((entry, i) => (
          <li key={entry.id} className={i === 0 ? "" : "mt-12"}>
            <Reveal delay={i * 0.06}>
              <span
                aria-hidden="true"
                className="absolute -start-[5px] mt-2 block h-2.5 w-2.5 rounded-full border border-glacier/70 bg-ink"
              />
              <p className="font-mono text-[11px] tracking-wide text-glacier/80">
                {entry.period}
              </p>
              <h3 className="mt-2 font-display text-2xl font-light text-frost-50">
                {entry.institution}
              </h3>
              <p className="mt-2 max-w-lg text-[14px] leading-relaxed text-frost-400">
                {desc(entry.id)}
              </p>
            </Reveal>
          </li>
        ))}
      </ol>
      <Quip textKey="journey.quip" />
    </SectionShell>
  );
}
