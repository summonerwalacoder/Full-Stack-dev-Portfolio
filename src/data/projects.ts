export type ProjectArtVariant = "crop" | "dhruva" | "varun";

export interface Project {
  id: string;
  featured: boolean;
  kind: "team" | "personal";
  art: ProjectArtVariant;
  links: {
    repo?: string;
    design?: string;
    demo?: string;
  };
  meta: string[];
}

export const PROJECTS: Project[] = [
  {
    id: "smart-crop",
    featured: true,
    kind: "team",
    art: "crop",
    links: {
      repo: "https://github.com/summonerwalacoder/smart-crop-advisory-system",
      design: "https://www.figma.com/design/R4Ho8DRoYqvb1jEqE1rWC6/Smart-Crop-Advisory-System",
    },
    meta: ["Inverthon 2026", "Invertis University"],
  },
  {
    id: "dhruva",
    featured: true,
    kind: "team",
    art: "dhruva",
    links: {
      repo: "https://github.com/summonerwalacoder/Dhruva-AI-powered-polar-mission-control-system",
    },
    meta: ["Smart India Hackathon 2026", "SIH26062"],
  },
  {
    id: "varun-x",
    featured: true,
    kind: "team",
    art: "varun",
    links: {
      repo: "https://github.com/summonerwalacoder/Varun-X-AI-integrated-spatio-temporal-extreme-weather-intelligence-disaster-response-system",
    },
    meta: ["TypeScript"],
  },
];

export interface MinorProject {
  id: string;
  repo: string;
  language: string;
}

export const MINOR_PROJECTS: MinorProject[] = [
  {
    id: "typing-master",
    repo: "https://github.com/summonerwalacoder/Typing-master",
    language: "C",
  },
  {
    id: "subway-game",
    repo: "https://github.com/summonerwalacoder/subway-surfers-game",
    language: "HTML",
  },
];
