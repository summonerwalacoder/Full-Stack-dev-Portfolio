"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { Quip } from "./Quip";

export function About() {
  const { t } = useI18n();

  return (
    <SectionShell
      id="about"
      index="01"
      label={t("about.label")}
      title={t("about.title")}
    >
      <div className="grid gap-10 md:grid-cols-[1.35fr_1fr] md:gap-16">
        <Reveal>
          <div className="space-y-6 text-[15px] leading-relaxed text-frost-300">
            <p>{t("about.p1")}</p>
            <p>{t("about.p2")}</p>
            <p className="text-frost-400">{t("about.p3")}</p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="border-s border-white/[0.09] ps-6 md:ps-8">
            <h3 className="text-[11px] uppercase tracking-label text-frost-500">
              {t("about.interestsTitle")}
            </h3>
            <p className="mt-4 font-display text-lg font-light leading-relaxed text-glacier">
              {t("about.interests")}
            </p>
          </div>
        </Reveal>
      </div>
      <Quip textKey="about.quip" />
    </SectionShell>
  );
}
