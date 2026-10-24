import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const LOCALES = ["en", "hi", "es", "fr", "ja", "de"] as const;
type Locale = (typeof LOCALES)[number];

const EXTRA: Record<Locale, string> = {
  en: `  "music.status.paused": "Paused",
  "music.status.connecting": "Connecting…",
  "music.status.unavailable": "Unavailable",
`,
  hi: `  "music.status.paused": "रोका गया",
  "music.status.connecting": "कनेक्ट हो रहा है…",
  "music.status.unavailable": "उपलब्ध नहीं",
`,
  es: `  "music.status.paused": "En pausa",
  "music.status.connecting": "Conectando…",
  "music.status.unavailable": "No disponible",
`,
  fr: `  "music.status.paused": "En pause",
  "music.status.connecting": "Connexion…",
  "music.status.unavailable": "Indisponible",
`,
  ja: `  "music.status.paused": "一時停止中",
  "music.status.connecting": "接続中…",
  "music.status.unavailable": "利用不可",
`,
  de: `  "music.status.paused": "Pausiert",
  "music.status.connecting": "Verbinden…",
  "music.status.unavailable": "Nicht verfügbar",
`,
};

for (const loc of LOCALES) {
  const path = resolve(`src/i18n/locales/${loc}.ts`);
  const lines = readFileSync(path, "utf8").split(/\r?\n/);
  const idx = lines.findIndex((l) => l.includes('"music.status.ready":'));
  if (idx === -1) throw new Error(`no music.status.ready in ${loc}`);
  const next = [...lines.slice(0, idx + 1), ...EXTRA[loc].split("\n"), ...lines.slice(idx + 1)];
  writeFileSync(path, next.join("\n"), "utf8");
  console.log(`updated ${loc}`);
}
