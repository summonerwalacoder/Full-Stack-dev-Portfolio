import { DICTIONARIES } from "../src/i18n/index";
import { LOCALES } from "../src/i18n/config";

const en = DICTIONARIES.en;
const enKeys = Object.keys(en);

let problems = 0;

for (const meta of LOCALES) {
  const dict = DICTIONARIES[meta.code];
  if (meta.coverage === "pending") {
    if (dict) {
      console.log(`${meta.code}: pending locale should not ship a dictionary yet`);
      problems++;
    }
    continue;
  }
  if (!dict) {
    console.log(`MISSING DICT: ${meta.code}`);
    problems++;
    continue;
  }
  if (meta.coverage === "full") {
    const missing = enKeys.filter((k) => !dict[k] || dict[k].trim() === "");
    if (missing.length) {
      console.log(`${meta.code}: missing ${missing.length} keys -> ${missing.slice(0, 10).join(", ")}${missing.length > 10 ? "..." : ""}`);
      problems++;
    }
    const extra = Object.keys(dict).filter((k) => !(k in en));
    if (extra.length) {
      console.log(`${meta.code}: extra keys -> ${extra.join(", ")}`);
      problems++;
    }
  } else {
    const unknown = Object.keys(dict).filter((k) => !(k in en));
    if (unknown.length) {
      console.log(`${meta.code}: unknown keys -> ${unknown.join(", ")}`);
      problems++;
    }
  }
}

console.log(problems === 0 ? "i18n check passed" : `i18n check: ${problems} problem(s)`);
