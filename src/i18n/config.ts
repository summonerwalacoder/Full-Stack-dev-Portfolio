export type Coverage = "full" | "core" | "pending";

export type ScriptGroup =
  | "latin"
  | "devanagari"
  | "bengali"
  | "telugu"
  | "tamil"
  | "gujarati"
  | "kannada"
  | "malayalam"
  | "oriya"
  | "gurmukhi"
  | "assamese"
  | "arabic"
  | "japanese";

export interface LocaleMeta {
  code: string;
  englishName: string;
  nativeName: string;
  dir: "ltr" | "rtl";
  coverage: Coverage;
  script: ScriptGroup;
}

export const DEFAULT_LOCALE = "en";

export const RTL_CODES = new Set(["ur", "sd"]);

export const LOCALES: LocaleMeta[] = [
  { code: "en", englishName: "English", nativeName: "English", dir: "ltr", coverage: "full", script: "latin" },
  { code: "hi", englishName: "Hindi", nativeName: "हिन्दी", dir: "ltr", coverage: "full", script: "devanagari" },
  { code: "es", englishName: "Spanish", nativeName: "Español", dir: "ltr", coverage: "full", script: "latin" },
  { code: "fr", englishName: "French", nativeName: "Français", dir: "ltr", coverage: "full", script: "latin" },
  { code: "ja", englishName: "Japanese", nativeName: "日本語", dir: "ltr", coverage: "full", script: "japanese" },
  { code: "de", englishName: "German", nativeName: "Deutsch", dir: "ltr", coverage: "full", script: "latin" },
  { code: "bn", englishName: "Bengali", nativeName: "বাংলা", dir: "ltr", coverage: "core", script: "bengali" },
  { code: "te", englishName: "Telugu", nativeName: "తెలుగు", dir: "ltr", coverage: "core", script: "telugu" },
  { code: "mr", englishName: "Marathi", nativeName: "मराठी", dir: "ltr", coverage: "core", script: "devanagari" },
  { code: "ta", englishName: "Tamil", nativeName: "தமிழ்", dir: "ltr", coverage: "core", script: "tamil" },
  { code: "ur", englishName: "Urdu", nativeName: "اردو", dir: "rtl", coverage: "core", script: "arabic" },
  { code: "gu", englishName: "Gujarati", nativeName: "ગુજરાતી", dir: "ltr", coverage: "core", script: "gujarati" },
  { code: "kn", englishName: "Kannada", nativeName: "ಕನ್ನಡ", dir: "ltr", coverage: "core", script: "kannada" },
  { code: "ml", englishName: "Malayalam", nativeName: "മലയാളം", dir: "ltr", coverage: "core", script: "malayalam" },
  { code: "or", englishName: "Odia", nativeName: "ଓଡ଼ିଆ", dir: "ltr", coverage: "core", script: "oriya" },
  { code: "pa", englishName: "Punjabi", nativeName: "ਪੰਜਾਬੀ", dir: "ltr", coverage: "core", script: "gurmukhi" },
  { code: "as", englishName: "Assamese", nativeName: "অসমীয়া", dir: "ltr", coverage: "core", script: "assamese" },
  { code: "ne", englishName: "Nepali", nativeName: "नेपाली", dir: "ltr", coverage: "core", script: "devanagari" },
  { code: "sd", englishName: "Sindhi", nativeName: "سنڌي", dir: "rtl", coverage: "core", script: "arabic" },
  { code: "ks", englishName: "Kashmiri", nativeName: "كٲشُر", dir: "rtl", coverage: "pending", script: "arabic" },
  { code: "doi", englishName: "Dogri", nativeName: "डोगरी", dir: "ltr", coverage: "pending", script: "devanagari" },
  { code: "kok", englishName: "Konkani", nativeName: "कोंकणी", dir: "ltr", coverage: "pending", script: "devanagari" },
  { code: "mni", englishName: "Manipuri (Meitei)", nativeName: "ꯃꯤꯇꯩꯂꯣꯟ", dir: "ltr", coverage: "pending", script: "latin" },
  { code: "mai", englishName: "Maithili", nativeName: "मैथिली", dir: "ltr", coverage: "pending", script: "devanagari" },
  { code: "bfr", englishName: "Bodo", nativeName: "बड़ो", dir: "ltr", coverage: "pending", script: "devanagari" },
  { code: "sat", englishName: "Santali", nativeName: "ᱥᱟᱱᱛᱟᱲᱤ", dir: "ltr", coverage: "pending", script: "latin" },
];

export function getLocaleMeta(code: string): LocaleMeta {
  return LOCALES.find((l) => l.code === code) ?? LOCALES[0];
}

export function isRtl(code: string): boolean {
  return getLocaleMeta(code).dir === "rtl";
}
