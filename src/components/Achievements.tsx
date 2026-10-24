"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { CV } from "@/data/cv";
import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { Quip } from "./Quip";


const DESC: Record<string, string> = {
  inverthon: "achievements.a1",
  hackbhoomi: "achievements.a2",
  quiz: "achievements.a3",
};

export function Achievements() {
  const { t } = useI18n();

  return (
    <SectionShell
      id="achievements"
      index="05"
      label={t("achievements.label")}
      title={t("achievements.title")}
      intro={t("achievements.intro")}
    >
      <ul>
        {CV.achievements.map((a, i) => (
          <li key={a.id}>
            <Reveal delay={i * 0.06}>
              <div className="grid gap-2 border-t border-white/[0.09] py-7 md:grid-cols-[8rem_1fr] md:gap-8">
                <p className="font-mono text-[11px] uppercase tracking-wide text-glacier/80">
                  {a.year}
                </p>
                <div>
                  <h3 className="font-display text-lg font-normal text-frost-100">
                    {a.title}
                  </h3>
                  <p className="mt-1.5 max-w-2xl text-[14px] leading-relaxed text-frost-400">
                    {t(DESC[a.id])}
                  </p>
                </div>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
      <Quip
        textKey="achievements.quip"
        className="mt-6 text-[12px] italic text-frost-500"
      />
      <Quip
        textKey="achievements.certs"
        className="mt-2 text-[12px] italic text-frost-500"
      />
    </SectionShell>
  );
}
