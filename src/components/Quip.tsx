"use client";

import { useI18n } from "@/i18n/I18nProvider";

export function Quip({
  textKey,
  className = "mt-10 text-[12px] italic text-frost-500",
}: {
  textKey: string;
  className?: string;
}) {
  const { t } = useI18n();
  return <p className={className}>{t(textKey)}</p>;
}
