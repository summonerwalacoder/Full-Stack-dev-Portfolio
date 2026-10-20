import { en } from "./locales/en";
import { hi } from "./locales/hi";
import { es } from "./locales/es";
import { fr } from "./locales/fr";
import { ja } from "./locales/ja";
import { de } from "./locales/de";
import { bn } from "./locales/bn";
import { te } from "./locales/te";
import { mr } from "./locales/mr";
import { ta } from "./locales/ta";
import { ur } from "./locales/ur";
import { gu } from "./locales/gu";
import { kn } from "./locales/kn";
import { ml } from "./locales/ml";
import { or } from "./locales/or";
import { pa } from "./locales/pa";
import { as } from "./locales/as";
import { ne } from "./locales/ne";
import { sd } from "./locales/sd";

export const DICTIONARIES: Record<string, Record<string, string>> = {
  en,
  hi,
  es,
  fr,
  ja,
  de,
  bn,
  te,
  mr,
  ta,
  ur,
  gu,
  kn,
  ml,
  or,
  pa,
  as,
  ne,
  sd,
};

export { DEFAULT_LOCALE, LOCALES, getLocaleMeta, isRtl } from "./config";
export type { LocaleMeta, Coverage } from "./config";
