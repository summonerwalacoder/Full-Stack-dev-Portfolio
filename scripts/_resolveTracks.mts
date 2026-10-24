/**
 * One-off local resolver: maps catalogue songs to real, embeddable YouTube videos.
 *
 * Usage:
 *   $env:YT_API_KEY="..."; npx --yes tsx scripts/_resolveTracks.mts
 *
 * - Reads scripts/_songs.txt  (genreId | title | artist)
 * - Uses YouTube Data API v3 search.list (videoEmbeddable=true) to find candidates
 * - Verifies the chosen candidate via the public oEmbed endpoint (no key)
 * - Caches every result in scripts/_resolved.json so re-runs are cheap/resumable
 * - Writes src/data/tracks.ts
 *
 * IMPORTANT: search.list is limited to 100 calls/day per project on the default
 * quota. This script stops after SEARCH_BUDGET searches per run and tells you to
 * run again tomorrow (results are cached, so progress is preserved).
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";
import { GENRES } from "./_genres.mts";

const API_KEY = process.env.YT_API_KEY;
if (!API_KEY) {
  console.error("Missing YT_API_KEY env var.");
  process.exit(1);
}

const SEARCH_BUDGET = Number(process.env.YT_SEARCH_BUDGET ?? 90);

type Song = { genre: string; title: string; artist: string };
type Resolved = {
  genre: string;
  title: string;
  artist: string;
  videoId: string | null;
  matchedTitle?: string;
  matchedChannel?: string;
  verified: boolean;
  note?: string;
};

const root = process.cwd();
const songsPath = resolve(root, "scripts", "_songs.txt");
const cachePath = resolve(root, "scripts", "_resolved.json");
const outPath = resolve(root, "src", "data", "tracks.ts");

const genreIds = new Set(GENRES.map((g) => g.id));

function loadSongs(): Song[] {
  const raw = readFileSync(songsPath, "utf8");
  const out: Song[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const parts = trimmed.split("|").map((p) => p.trim());
    if (parts.length < 3) {
      console.warn(`skip malformed line: ${trimmed}`);
      continue;
    }
    const [genre, title, artist] = parts;
    if (!genreIds.has(genre)) {
      console.warn(`skip unknown genre "${genre}" for "${title}"`);
      continue;
    }
    out.push({ genre, title, artist });
  }
  return out;
}

function loadCache(): Resolved[] {
  if (!existsSync(cachePath)) return [];
  try {
    return JSON.parse(readFileSync(cachePath, "utf8")) as Resolved[];
  } catch {
    return [];
  }
}

const keyOf = (s: Song) => `${s.genre}::${s.title}::${s.artist}`;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ytSearch(query: string): Promise<{
  videoId: string;
  title: string;
  channel: string;
} | null> {
  const url =
    `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video` +
    `&videoEmbeddable=true&maxResults=5&q=${encodeURIComponent(query)}&key=${API_KEY}`;
  const res = await fetch(url);
  if (res.status === 403) {
    throw new Error("QUOTA_EXCEEDED");
  }
  if (!res.ok) {
    throw new Error(`search failed ${res.status}`);
  }
  const json = (await res.json()) as {
    items?: Array<{
      id: { videoId: string };
      snippet: { title: string; channelTitle: string };
    }>;
  };
  const first = json.items?.[0];
  if (!first) return null;
  return {
    videoId: first.id.videoId,
    title: first.snippet.title,
    channel: first.snippet.channelTitle,
  };
}

async function verifyEmbeddable(videoId: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=${encodeURIComponent(
        `https://www.youtube.com/watch?v=${videoId}`,
      )}&format=json`,
    );
    return res.ok;
  } catch {
    return false;
  }
}

async function main() {
  const songs = loadSongs();
  const cache = loadCache();
  const done = new Map(cache.map((r) => [keyOf(r), r]));

  // Interleave songs by genre (round-robin) so each daily budget spreads
  // across every genre instead of exhausting the first genre in file order.
  const byGenre = new Map<string, Song[]>();
  for (const song of songs) {
    const arr = byGenre.get(song.genre);
    if (arr) arr.push(song);
    else byGenre.set(song.genre, [song]);
  }
  const genreOrder = GENRES.map((g) => g.id).filter((id) => byGenre.has(id));
  const ordered: Song[] = [];
  const maxLen = Math.max(0, ...[...byGenre.values()].map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const id of genreOrder) {
      const arr = byGenre.get(id);
      if (arr && arr[i]) ordered.push(arr[i]);
    }
  }

  let searchesUsed = 0;
  let newlyResolved = 0;

  for (const song of ordered) {
    const k = keyOf(song);
    if (done.has(k)) continue;
    if (searchesUsed >= SEARCH_BUDGET) {
      console.log(
        `Reached search budget (${SEARCH_BUDGET}). Re-run later; progress is cached.`,
      );
      break;
    }

    const query = `${song.title} ${song.artist} official`;
    let entry: Resolved;
    try {
      const hit = await ytSearch(query);
      searchesUsed++;
      if (!hit) {
        entry = { ...song, videoId: null, verified: false, note: "no result" };
      } else {
        const ok = await verifyEmbeddable(hit.videoId);
        entry = {
          ...song,
          videoId: hit.videoId,
          matchedTitle: hit.title,
          matchedChannel: hit.channel,
          verified: ok,
          note: ok ? undefined : "not embeddable",
        };
      }
    } catch (err) {
      if (String(err).includes("QUOTA_EXCEEDED")) {
        console.log("Search quota exceeded for the day. Re-run tomorrow.");
        break;
      }
      entry = { ...song, videoId: null, verified: false, note: String(err) };
      searchesUsed++;
    }

    done.set(k, entry);
    newlyResolved++;
    writeFileSync(cachePath, JSON.stringify([...done.values()], null, 2), "utf8");
    console.log(
      `${entry.verified ? "OK " : "MISS"} ${song.genre} | ${song.title} -> ${
        entry.videoId ?? "-"
      }`,
    );
    await sleep(150);
  }

  const all = [...done.values()];
  const verified = all.filter((r) => r.verified);
  console.log(
    `\nresolved ${verified.length}/${songs.length} verified (this run added ${newlyResolved}, searches used ${searchesUsed}).`,
  );

  writeTracksFile(all);
}

function esc(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

function writeTracksFile(all: Resolved[]) {
  const header = `/**
 * AUTO-GENERATED by scripts/_resolveTracks.mts — do not edit by hand.
 * Every entry was resolved via the YouTube Data API and verified through the
 * public oEmbed endpoint. Entries with verified=false could not be confirmed as
 * embeddable and must render as "Full playback unavailable" in the UI.
 */
import type { Track } from "./musicTypes";

export const TRACKS: Track[] = [
`;

  const body = all
    .map((r) => {
      const id = `${r.genre}-${slug(r.title)}-${slug(r.artist)}`;
      return [
        "  {",
        `    id: "${esc(id)}",`,
        `    genre: "${esc(r.genre)}",`,
        `    title: "${esc(r.title)}",`,
        `    artist: "${esc(r.artist)}",`,
        `    source: "youtube",`,
        `    videoId: ${r.videoId ? `"${esc(r.videoId)}"` : "null"},`,
        `    verified: ${r.verified},`,
        r.note ? `    note: "${esc(r.note)}",` : null,
        "  },",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");

  writeFileSync(outPath, `${header}${body}\n];\n`, "utf8");
  console.log(`wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
