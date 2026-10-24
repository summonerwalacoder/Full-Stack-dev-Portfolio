import { CV } from "@/data/cv";
import { PROJECTS, MINOR_PROJECTS } from "@/data/projects";

export type WorldId =
  | "origin"
  | "skills"
  | "projects"
  | "achievements"
  | "frontier";

export type WorldArtifact =
  | "crystal"
  | "constellation"
  | "core"
  | "emblem"
  | "signal";

export interface WorldLink {
  labelKey: string;
  href: string;
}

export interface WorldEntry {
  id: string;
  titleKey: string;
  detailKey: string;
  href?: string;
}

export interface WorldDef {
  id: WorldId;
  /** orbit radius as a fraction of the map half-size */
  orbit: number;
  /** angle in degrees on the map */
  angle: number;
  size: number;
  accent: string;
  glow: string;
  artifact: WorldArtifact;
  iconKey: string;
  nameKey: string;
  tagKey: string;
  narrativeKey: string;
  artifactKey: string;
  hintKey: string;
  entries: WorldEntry[];
  links?: WorldLink[];
}

/** Real project links only â€” every href points to an existing destination. */
const REPO = PROJECTS;

export const WORLDS: WorldDef[] = [
  {
    id: "origin",
    orbit: 0.62,
    angle: -90,
    size: 78,
    accent: "#9CC5E8",
    glow: "156,197,232",
    artifact: "crystal",
    iconKey: "mv.w.origin.icon",
    nameKey: "mv.w.origin.name",
    tagKey: "mv.w.origin.tag",
    narrativeKey: "mv.w.origin.narrative",
    artifactKey: "mv.w.origin.artifact",
    hintKey: "mv.w.origin.hint",
    entries: [
      {
        id: "invertis",
        titleKey: "mv.w.origin.e.invertis",
        detailKey: "mv.w.origin.e.invertis.d",
      },
      {
        id: "jkg",
        titleKey: "mv.w.origin.e.jkg",
        detailKey: "mv.w.origin.e.jkg.d",
      },
      {
        id: "aps",
        titleKey: "mv.w.origin.e.aps",
        detailKey: "mv.w.origin.e.aps.d",
      },
    ],
  },
  {
    id: "skills",
    orbit: 0.72,
    angle: -18,
    size: 96,
    accent: "#8FD3C7",
    glow: "143,211,199",
    artifact: "constellation",
    iconKey: "mv.w.skills.icon",
    nameKey: "mv.w.skills.name",
    tagKey: "mv.w.skills.tag",
    narrativeKey: "mv.w.skills.narrative",
    artifactKey: "mv.w.skills.artifact",
    hintKey: "mv.w.skills.hint",
    entries: [
      { id: "langs", titleKey: "mv.w.skills.e.langs", detailKey: "mv.w.skills.e.langs.d" },
      { id: "data", titleKey: "mv.w.skills.e.data", detailKey: "mv.w.skills.e.data.d" },
      { id: "tools", titleKey: "mv.w.skills.e.tools", detailKey: "mv.w.skills.e.tools.d" },
    ],
  },
  {
    id: "projects",
    orbit: 0.66,
    angle: 54,
    size: 104,
    accent: "#E8A87C",
    glow: "232,168,124",
    artifact: "core",
    iconKey: "mv.w.projects.icon",
    nameKey: "mv.w.projects.name",
    tagKey: "mv.w.projects.tag",
    narrativeKey: "mv.w.projects.narrative",
    artifactKey: "mv.w.projects.artifact",
    hintKey: "mv.w.projects.hint",
    entries: [
      {
        id: "smart-crop",
        titleKey: "projects.crop.title",
        detailKey: "mv.w.projects.e.crop.d",
        href: REPO[0].links.repo,
      },
      {
        id: "dhruva",
        titleKey: "projects.dhruva.title",
        detailKey: "mv.w.projects.e.dhruva.d",
        href: REPO[1].links.repo,
      },
      {
        id: "varun-x",
        titleKey: "projects.varun.title",
        detailKey: "mv.w.projects.e.varun.d",
        href: REPO[2].links.repo,
      },
      {
        id: "typing-master",
        titleKey: "projects.minor.typing",
        detailKey: "mv.w.projects.e.typing.d",
        href: MINOR_PROJECTS[0].repo,
      },
      {
        id: "subway-game",
        titleKey: "projects.minor.game",
        detailKey: "mv.w.projects.e.game.d",
        href: MINOR_PROJECTS[1].repo,
      },
    ],
  },
  {
    id: "achievements",
    orbit: 0.74,
    angle: 122,
    size: 90,
    accent: "#D9B3F0",
    glow: "217,179,240",
    artifact: "emblem",
    iconKey: "mv.w.ach.icon",
    nameKey: "mv.w.ach.name",
    tagKey: "mv.w.ach.tag",
    narrativeKey: "mv.w.ach.narrative",
    artifactKey: "mv.w.ach.artifact",
    hintKey: "mv.w.ach.hint",
    entries: [
      { id: "inverthon", titleKey: "mv.w.ach.e.inverthon", detailKey: "mv.w.ach.e.inverthon.d" },
      { id: "hackbhoomi", titleKey: "mv.w.ach.e.hackbhoomi", detailKey: "mv.w.ach.e.hackbhoomi.d" },
      { id: "quiz", titleKey: "mv.w.ach.e.quiz", detailKey: "mv.w.ach.e.quiz.d" },
    ],
  },
  {
    id: "frontier",
    orbit: 0.7,
    angle: 196,
    size: 84,
    accent: "#7FB0FF",
    glow: "127,176,255",
    artifact: "signal",
    iconKey: "mv.w.frontier.icon",
    nameKey: "mv.w.frontier.name",
    tagKey: "mv.w.frontier.tag",
    narrativeKey: "mv.w.frontier.narrative",
    artifactKey: "mv.w.frontier.artifact",
    hintKey: "mv.w.frontier.hint",
    entries: [
      { id: "ai", titleKey: "mv.w.frontier.e.ai", detailKey: "mv.w.frontier.e.ai.d" },
      { id: "learning", titleKey: "mv.w.frontier.e.learning", detailKey: "mv.w.frontier.e.learning.d" },
      { id: "solving", titleKey: "mv.w.frontier.e.solving", detailKey: "mv.w.frontier.e.solving.d" },
    ],
  },
];

export interface CenterDef {
  id: "sumit";
  nameKey: string;
  tagKey: string;
  roleKey: string;
  introKey: string;
  noteKey: string;
}

/** The central star of the multiverse — Sumit himself. */
export const CENTER: CenterDef = {
  id: "sumit",
  nameKey: "mv.center.name",
  tagKey: "mv.center.tag",
  roleKey: "mv.center.role",
  introKey: "mv.center.intro",
  noteKey: "mv.center.note",
};

export const ARTIFACT_LABEL: Record<WorldArtifact, string> = {
  crystal: "mv.artifact.crystal",
  constellation: "mv.artifact.constellation",
  core: "mv.artifact.core",
  emblem: "mv.artifact.emblem",
  signal: "mv.artifact.signal",
};

/** Documented contact channel for the final transmission. */
export const CONTACT_ID = "contact";

export const MULTIVERSE = {
  name: CV.name,
  tagline: CV.tagline,
  links: CV.links,
  email: CV.email,
} as const;

