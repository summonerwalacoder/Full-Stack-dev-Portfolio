"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { Quip } from "./Quip";

export function Interests() {
  const { t } = useI18n();

  return (
    <SectionShell
      id="interests"
      index="06"
      label={t("interests.label")}
      title={t("interests.title")}
    >
      <Reveal>
        <p className="max-w-2xl font-display text-xl font-light leading-relaxed text-frost-300 md:text-[1.6rem]">
          {t("interests.body")}
        </p>
      </Reveal>
      <Quip textKey="interests.quip" />
    </SectionShell>
  );
}
