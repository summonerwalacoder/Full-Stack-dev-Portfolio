"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { PROJECTS, MINOR_PROJECTS, type ProjectArtVariant } from "@/data/projects";
import { SectionShell } from "./SectionShell";
import { Reveal } from "./Reveal";
import { Quip } from "./Quip";

function ProjectArt({ variant }: { variant: ProjectArtVariant }) {
  const stroke = "#9CC5E8";

  if (variant === "crop") {
    return (
      <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
        <g fill="none" stroke={stroke} strokeWidth="1">
          <path d="M40 160h240" opacity="0.35" />
          <path d="M60 160v-46m0 46v-20" opacity="0.5" />
          <path d="M60 118c-10-6-16-16-14-28 12 2 20 10 22 20 4-10 14-16 24-14-2 12-12 20-24 22" opacity="0.85" />
          <path d="M120 160v-34m12 34v-52m12 52v-26m12 26v-44m12 44v-18" opacity="0.45" />
          <rect x="200" y="70" width="84" height="64" opacity="0.4" />
          <path d="M214 92h56M214 106h40M214 120h48" opacity="0.55" />
          <path d="M192 102h8" opacity="0.7" />
          <circle cx="196" cy="102" r="2.4" fill={stroke} stroke="none" opacity="0.9" />
          <circle cx="60" cy="104" r="2.4" fill={stroke} stroke="none" opacity="0.9" />
        </g>
      </svg>
    );
  }

  if (variant === "dhruva") {
    return (
      <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
        <g fill="none" stroke={stroke} strokeWidth="1">
          <circle cx="160" cy="100" r="70" opacity="0.3" />
          <circle cx="160" cy="100" r="48" opacity="0.45" />
          <circle cx="160" cy="100" r="26" opacity="0.6" />
          <path d="M90 100h140M160 30v140" opacity="0.25" />
          <path d="M112 52l96 96M208 52l-96 96" opacity="0.18" />
          <path d="M160 52c22 12 34 28 34 48s-12 36-34 48c-22-12-34-28-34-48s12-36 34-48z" opacity="0.55" />
          <circle cx="160" cy="100" r="3" fill={stroke} stroke="none" />
          <rect x="36" y="40" width="44" height="26" opacity="0.4" />
          <path d="M44 52h28M44 58h18" opacity="0.5" />
          <rect x="240" y="134" width="44" height="26" opacity="0.4" />
          <path d="M248 146h28M248 152h20" opacity="0.5" />
        </g>
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 320 200" className="h-full w-full" aria-hidden="true">
      <g fill="none" stroke={stroke} strokeWidth="1">
        <path d="M20 130c30-40 60-40 90 0s60 40 90 0 60-40 90 0" opacity="0.5" />
        <path d="M20 110c30-36 60-36 90 0s60 36 90 0 60-36 90 0" opacity="0.35" />
        <path d="M20 150c30-32 60-32 90 0s60 32 90 0 60-32 90 0" opacity="0.25" />
        <path d="M40 40l30 34-30 34" opacity="0.4" />
        <path d="M20 74h56" opacity="0.4" />
        <circle cx="230" cy="70" r="16" opacity="0.55" />
        <path d="M230 46v-10M230 104v-10M254 70h10M196 70h10" opacity="0.45" />
        <circle cx="230" cy="70" r="3" fill={stroke} stroke="none" />
      </g>
    </svg>
  );
}

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="link-underline text-[13px] text-frost-300 transition-colors duration-300 hover:text-glacier"
    >
      {children}
    </a>
  );
}

type FilterId = "all" | "ai" | "practice";
type Detail = { id: string; group: "ai" | "practice"; featured: boolean };

export function Projects() {
  const { t } = useI18n();
  const [filter, setFilter] = useState<FilterId>("all");
  const [detail, setDetail] = useState<Detail | null>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const restoreRef = useRef<HTMLElement | null>(null);
  const tiltOk = useRef(false);

  useEffect(() => {
    const mq = window.matchMedia(
      "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)",
    );
    const sync = () => {
      tiltOk.current = mq.matches;
    };
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!detail) return;
    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFrame = requestAnimationFrame(() => closeRef.current?.focus());

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setDetail(null);
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [detail]);

  const openDetail = (id: string, featured: boolean) => {
    setDetail({ id, group: featured ? "ai" : "practice", featured });
  };

  const onTiltMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!tiltOk.current) return;
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${(-py * 7).toFixed(2)}deg) rotateY(${(px * 7).toFixed(
      2,
    )}deg) scale(1.03)`;
  };

  const onTiltLeave = (e: ReactPointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.transform = "";
  };

  const featureTitle = (id: string) =>
    id === "smart-crop"
      ? t("projects.crop.title")
      : id === "dhruva"
        ? t("projects.dhruva.title")
        : t("projects.varun.title");

  const featureCategory = (id: string) =>
    id === "smart-crop"
      ? t("projects.crop.category")
      : id === "dhruva"
        ? t("projects.dhruva.category")
        : t("projects.varun.category");

  const minorTitle = (id: string) =>
    id === "typing-master" ? t("projects.minor.typing") : t("projects.minor.game");

  const detailProject = detail?.featured ? PROJECTS.find((p) => p.id === detail?.id) : undefined;
  const detailMinor = detail && !detail.featured ? MINOR_PROJECTS.find((m) => m.id === detail.id) : undefined;

  const entries: Detail[] = [
    ...PROJECTS.map((p) => ({ id: p.id, group: "ai" as const, featured: true })),
    ...MINOR_PROJECTS.map((m) => ({ id: m.id, group: "practice" as const, featured: false })),
  ];
  const visible = entries.filter((e) => filter === "all" || e.group === filter);

  const filters: { id: FilterId; label: string }[] = [
    { id: "all", label: t("projects.filterAll") },
    { id: "ai", label: t("projects.filterAI") },
    { id: "practice", label: t("projects.filterPractice") },
  ];

  const flagship = PROJECTS[0];

  return (
    <SectionShell
      id="projects"
      index="02"
      label={t("projects.label")}
      title={t("projects.title")}
      intro={t("projects.intro")}
    >
      <div>
        <Reveal>
          <div className="mb-14">
            <div className="flex items-baseline justify-between gap-4">
              <h3 className="text-[11px] uppercase tracking-label text-frost-500">
                {t("projects.playground")}
              </h3>
              <span className="font-mono text-[10.5px] text-frost-600">
                {t("projects.preview")}
              </span>
            </div>
            <div className="mt-4 overflow-hidden rounded-lg border border-white/[0.1] bg-ink-raised transition-colors duration-500 hover:border-glacier/30">
              <div className="flex items-center gap-3 border-b border-white/[0.08] bg-ink/60 px-4 py-2.5">
                <span aria-hidden="true" className="flex gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-frost-600/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-frost-600/40" />
                  <span className="h-2.5 w-2.5 rounded-full bg-glacier/50" />
                </span>
                <span className="min-w-0 flex-1 truncate rounded bg-ink px-3 py-1 font-mono text-[11px] text-frost-500">
                  github.com/summonerwalacoder/smart-crop-advisory-system
                </span>
              </div>
              <div className="grid gap-6 p-5 md:grid-cols-[1.1fr_1fr] md:items-center md:p-7">
                <div className="relative aspect-[16/10] overflow-hidden border border-white/[0.08] bg-ink">
                  <div className="absolute inset-0 p-5">
                    <ProjectArt variant={flagship.art} />
                  </div>
                </div>
                <div>
                  <p className="text-[14.5px] leading-relaxed text-frost-400">
                    {t("projects.playgroundNote")}
                  </p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2">
                    {flagship.links.repo && (
                      <ExternalLink href={flagship.links.repo}>{t("projects.repo")}</ExternalLink>
                    )}
                    {flagship.links.design && (
                      <ExternalLink href={flagship.links.design}>{t("projects.design")}</ExternalLink>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal>
          <div
            role="group"
            aria-label={t("projects.label")}
            className="mb-2 flex flex-wrap items-center gap-2 border-t border-white/[0.09] pt-8"
          >
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={`rounded-full border px-4 py-1.5 text-[12px] transition-all duration-300 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97] ${
                  filter === f.id
                    ? "border-glacier/60 bg-glacier/[0.12] text-frost-50"
                    : "border-white/[0.12] text-frost-400 hover:border-glacier/40 hover:text-frost-200"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </Reveal>

        {visible.map((entry, i) => (
          <Reveal key={entry.id} delay={i * 0.05}>
            {entry.featured ? (
              <FeaturedCard
                id={entry.id}
                title={featureTitle(entry.id)}
                category={featureCategory(entry.id)}
                onOpen={() => openDetail(entry.id, true)}
                onTiltMove={onTiltMove}
                onTiltLeave={onTiltLeave}
                t={t}
              />
            ) : (
              <MinorCard
                id={entry.id}
                title={minorTitle(entry.id)}
                language={MINOR_PROJECTS.find((m) => m.id === entry.id)?.language ?? ""}
                repo={MINOR_PROJECTS.find((m) => m.id === entry.id)?.repo ?? "#"}
                onOpen={() => openDetail(entry.id, false)}
              />
            )}
          </Reveal>
        ))}

        <Reveal>
          <div className="border-t border-white/[0.09] pt-8">
            <p className="text-[13px] text-frost-500">{t("projects.demoNote")}</p>
          </div>
        </Reveal>
      </div>

      {detail && (
        <ProjectDetailModal
          detail={detail}
          closeRef={closeRef}
          onClose={() => setDetail(null)}
          title={
            detailProject
              ? featureTitle(detail.id)
              : minorTitle(detail.id)
          }
          category={detailProject ? featureCategory(detail.id) : detailMinor?.language ?? ""}
          kindLabel={
            detailProject
              ? detailProject.kind === "team"
                ? t("projects.team")
                : t("projects.personal")
              : detailMinor?.language ?? ""
          }
          art={detailProject?.art}
          links={detailProject?.links ?? (detailMinor ? { repo: detailMinor.repo } : { repo: undefined })}
          meta={detailProject?.meta ?? []}
        />
      )}

      <Quip textKey="projects.quip" />
    </SectionShell>
  );
}

function FeaturedCard({
  id,
  title,
  category,
  onOpen,
  onTiltMove,
  onTiltLeave,
  t,
}: {
  id: string;
  title: string;
  category: string;
  onOpen: () => void;
  onTiltMove: (e: ReactPointerEvent<HTMLDivElement>) => void;
  onTiltLeave: (e: ReactPointerEvent<HTMLDivElement>) => void;
  t: (key: string) => string;
}) {
  const isCrop = id === "smart-crop";
  const project = PROJECTS.find((p) => p.id === id)!;

  return (
    <article className="group grid gap-8 border-t border-white/[0.09] py-12 md:grid-cols-[1.25fr_1fr] md:gap-14 md:py-14">
      <div>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-label text-frost-500">
          <span className="text-glacier/80">{category}</span>
          <span aria-hidden="true" className="text-frost-500/50">
            ·
          </span>
          <span>{project.kind === "team" ? t("projects.team") : t("projects.personal")}</span>
        </div>

        <h3 className="mt-4 font-display text-[clamp(1.5rem,3vw,2.1rem)] font-light leading-tight text-frost-50">
          {title}
        </h3>

        <div className="mt-5 space-y-4 text-[14.5px] leading-relaxed text-frost-400">
          {isCrop ? (
            <>
              <p>
                <span className="me-2 text-[11px] uppercase tracking-label text-frost-500">
                  {t("projects.problem")}
                </span>
                {t("projects.crop.problem")}
              </p>
              <p>
                <span className="me-2 text-[11px] uppercase tracking-label text-frost-500">
                  {t("projects.approach")}
                </span>
                {t("projects.crop.approach")}
              </p>
            </>
          ) : (
            <p>{id === "dhruva" ? t("projects.dhruva.blurb") : t("projects.varun.blurb")}</p>
          )}
        </div>

        {isCrop && (
          <p className="mt-5 flex items-start gap-2.5 text-[13px] leading-relaxed text-glacier">
            <span
              aria-hidden="true"
              className="mt-[7px] block h-1.5 w-1.5 shrink-0 rounded-full bg-glacier"
            />
            <span>
              <span className="me-2 text-[11px] uppercase tracking-label text-frost-500">
                {t("projects.award")}
              </span>
              {t("projects.crop.award")}
            </span>
          </p>
        )}

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2">
          {project.links.repo && <ExternalLink href={project.links.repo}>{t("projects.repo")}</ExternalLink>}
          {project.links.design && (
            <ExternalLink href={project.links.design}>{t("projects.design")}</ExternalLink>
          )}
          <span className="text-[12px] text-frost-500">{project.meta.join(" · ")}</span>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="mt-7 inline-flex items-center gap-2 rounded border border-white/[0.14] px-4 py-2 text-[12px] uppercase tracking-label text-frost-300 transition-all duration-300 hover:border-glacier/50 hover:bg-glacier/[0.08] hover:text-frost-50 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
        >
          {t("projects.details")}
          <span aria-hidden="true" className="text-glacier">
            →
          </span>
        </button>
      </div>

      <div
        onPointerMove={onTiltMove}
        onPointerLeave={onTiltLeave}
        className="relative aspect-[16/10] overflow-hidden border border-white/[0.08] bg-ink-raised transition-[transform,border-color,box-shadow] duration-500 ease-soft group-hover:border-glacier/30 group-hover:shadow-[0_18px_40px_-24px_rgba(156,197,232,0.45)]"
        style={{ transformStyle: "preserve-3d" }}
      >
        <div className="absolute inset-0 p-4 transition-transform duration-700 ease-soft group-hover:scale-[1.04]">
          <ProjectArt variant={project.art} />
        </div>
      </div>
    </article>
  );
}

function MinorCard({
  title,
  language,
  repo,
  onOpen,
}: {
  id: string;
  title: string;
  language: string;
  repo: string;
  onOpen: () => void;
}) {
  const { t } = useI18n();

  return (
    <article className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 border-t border-white/[0.09] py-7 transition-colors duration-300 hover:border-glacier/25">
      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
        <h3 className="font-display text-[1.15rem] font-light text-frost-100">{title}</h3>
        <span className="font-mono text-[11px] text-frost-500">{language}</span>
      </div>
      <div className="flex items-center gap-5">
        <ExternalLink href={repo}>{t("projects.repo")}</ExternalLink>
        <button
          type="button"
          onClick={onOpen}
          className="text-[12px] uppercase tracking-label text-frost-400 transition-colors duration-300 hover:text-glacier focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
        >
          {t("projects.details")}
        </button>
      </div>
    </article>
  );
}

function ProjectDetailModal({
  detail,
  title,
  category,
  kindLabel,
  art,
  links,
  meta,
  closeRef,
  onClose,
}: {
  detail: Detail;
  title: string;
  category: string;
  kindLabel: string;
  art?: ProjectArtVariant;
  links: { repo?: string; design?: string; demo?: string };
  meta: string[];
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <div className="fixed inset-0 z-[75] flex items-center justify-center p-4 sm:p-6">
      <button
        type="button"
        aria-label={t("projects.details")}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-ink/80 backdrop-blur-[2px]"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={t("projects.details")}
        className="relative flex max-h-[86vh] w-[min(46rem,100%)] flex-col overflow-hidden rounded-lg border border-white/[0.12] bg-ink-raised shadow-[0_30px_80px_-24px_rgba(0,0,0,0.9)]"
      >
        <div className="flex items-start justify-between gap-4 border-b border-white/[0.09] px-5 py-4 sm:px-7">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-label text-glacier/80">{category}</p>
            <h3 className="mt-2 font-display text-[clamp(1.3rem,3vw,1.8rem)] font-light leading-tight text-frost-50">
              {title}
            </h3>
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            className="shrink-0 rounded border border-white/[0.12] px-3 py-1.5 font-mono text-[11px] text-frost-400 transition-colors hover:border-glacier/40 hover:text-frost-100 focus-visible:outline focus-visible:outline-1 focus-visible:outline-glacier active:scale-[0.97]"
          >
            esc
          </button>
        </div>

        <div className="overflow-y-auto px-5 py-5 sm:px-7 sm:py-6">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] uppercase tracking-label text-frost-500">
            <span>{kindLabel}</span>
            {meta.length > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>{meta.join(" · ")}</span>
              </>
            )}
          </div>

          {art && (
            <div className="relative mt-5 aspect-[16/10] overflow-hidden border border-white/[0.08] bg-ink">
              <div className="absolute inset-0 p-5">
                <ProjectArt variant={art} />
              </div>
            </div>
          )}

          <div className="mt-6 space-y-4 text-[14.5px] leading-relaxed text-frost-400">
            {detail.id === "smart-crop" ? (
              <>
                <p>
                  <span className="me-2 text-[11px] uppercase tracking-label text-frost-500">
                    {t("projects.problem")}
                  </span>
                  {t("projects.crop.problem")}
                </p>
                <p>
                  <span className="me-2 text-[11px] uppercase tracking-label text-frost-500">
                    {t("projects.approach")}
                  </span>
                  {t("projects.crop.approach")}
                </p>
                <p className="text-glacier">
                  <span className="me-2 text-[11px] uppercase tracking-label text-frost-500">
                    {t("projects.award")}
                  </span>
                  {t("projects.crop.award")}
                </p>
              </>
            ) : detail.id === "dhruva" ? (
              <p>{t("projects.dhruva.blurb")}</p>
            ) : detail.id === "varun-x" ? (
              <p>{t("projects.varun.blurb")}</p>
            ) : (
              <p>{title}</p>
            )}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-white/[0.09] pt-5">
            {links.repo && <ExternalLink href={links.repo}>{t("projects.repo")}</ExternalLink>}
            {links.design && <ExternalLink href={links.design}>{t("projects.design")}</ExternalLink>}
            {links.demo ? (
              <ExternalLink href={links.demo}>{t("projects.preview")}</ExternalLink>
            ) : (
              <span className="text-[12.5px] text-frost-500">{t("projects.demoNote")}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
