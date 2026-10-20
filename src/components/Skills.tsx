"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { CV } from "@/data/cv";
import { MINOR_PROJECTS } from "@/data/projects";
import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { Quip } from "./Quip";

const GROUPS = [
  { key: "programming", items: CV.skills.programming },
  { key: "tools", items: CV.skills.tools },
  { key: "areas", items: CV.skills.areas },
] as const;

export function Skills() {
  const { t } = useI18n();
  const [selected, setSelected] = useState<{ group: string; item: string } | null>(null);

  const typingRepo = MINOR_PROJECTS.find((m) => m.id === "typing-master")?.repo;
  const related =
    selected && selected.item === "C" && typingRepo
      ? { label: t("projects.minor.typing"), href: typingRepo }
      : null;

  return (
    <SectionShell
      id="skills"
      index="03"
      label={t("skills.label")}
      title={t("skills.title")}
      intro={t("skills.intro")}
    >
      <div className="grid gap-10 md:grid-cols-3 md:gap-12">
        {GROUPS.map((group, gi) => (
          <Reveal key={group.key} delay={gi * 0.08}>
            <div>
              <h3 className="border-b border-white/[0.09] pb-3 text-[11px] uppercase tracking-label text-glacier">
                {t(`skills.${group.key}`)}
              </h3>
              <ul>
                {group.items.map((item) => {
                  const active = selected?.item === item;
                  return (
                    <li key={item} className="border-b border-white/[0.05]">
                      <button
                        type="button"
                        aria-pressed={active}
                        onClick={() =>
                          setSelected((prev) =>
                            prev?.item === item ? null : { group: group.key, item },
                          )
                        }
                        className={`group flex w-full items-center gap-3 py-3 text-start transition-all duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.98] ${
                          active ? "ps-1" : "hover:ps-1"
                        }`}
                      >
                        <span
                          aria-hidden="true"
                          className={`h-1.5 w-1.5 shrink-0 rounded-full transition-all duration-300 ${
                            active
                              ? "bg-glacier shadow-[0_0_8px_rgba(156,197,232,0.8)]"
                              : "bg-frost-600 group-hover:bg-glacier/70"
                          }`}
                        />
                        <span
                          className={`text-[15px] transition-colors duration-300 ${
                            active ? "text-frost-50" : "text-frost-300 group-hover:text-frost-50"
                          }`}
                        >
                          {item}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Reveal>
        ))}
      </div>

      <div aria-live="polite">
        {selected && (
          <Reveal>
            <div className="mt-10 flex flex-wrap items-baseline justify-between gap-x-8 gap-y-4 border-t border-white/[0.09] pt-7">
              <div className="flex flex-wrap items-baseline gap-x-5 gap-y-2">
                <h3 className="font-display text-[clamp(1.3rem,3vw,1.9rem)] font-light text-frost-50">
                  {selected.item}
                </h3>
                <span className="text-[11px] uppercase tracking-label text-frost-500">
                  {t(`skills.${selected.group}`)}
                </span>
              </div>
              <div className="max-w-md text-[14px] leading-relaxed">
                <span className="me-2 text-[11px] uppercase tracking-label text-glacier/80">
                  {t("skills.usedIn")}
                </span>
                {related ? (
                  <a
                    href={related.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-underline text-frost-200 hover:text-glacier"
                  >
                    {related.label}
                  </a>
                ) : (
                  <span className="text-frost-400">{t("skills.usedNone")}</span>
                )}
              </div>
            </div>
          </Reveal>
        )}
      </div>

      <Quip textKey="skills.quip" />
    </SectionShell>
  );
}
