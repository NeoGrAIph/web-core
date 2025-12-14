import { promises as fs } from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const COURSE_ROOT = path.resolve(
  REPO_ROOT,
  "docs/course/production-monorepostwith-turborepo",
);
const LINK_MAP_PATH = path.join(COURSE_ROOT, "link-map.json");

async function listMarkdownFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) return listMarkdownFiles(fullPath);
      if (!entry.isFile()) return [];
      if (!entry.name.endsWith(".md")) return [];
      return [fullPath];
    }),
  );
  return files.flat();
}

function toPosixRelativePath(fromDir, filePath) {
  return path.relative(fromDir, filePath).split(path.sep).join("/");
}

function parseArgs(argv) {
  const args = { write: false, verbose: false };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--write") args.write = true;
    if (arg === "--verbose") args.verbose = true;
  }
  return args;
}

function normalizeUrlKey(urlString) {
  try {
    const url = new URL(urlString);
    const origin = url.origin.replace(/^http:/, "https:");
    let pathname = url.pathname;
    if (pathname.length > 1 && pathname.endsWith("/")) pathname = pathname.slice(0, -1);
    return { baseKey: `${origin}${pathname}`, hash: url.hash || "" };
  } catch {
    return null;
  }
}

function buildLookup(linkMap) {
  const exact = new Map(); // normalizedBase+hash -> repoRelativePath
  const base = new Map(); // normalizedBase -> repoRelativePath

  for (const [rawUrl, repoPath] of Object.entries(linkMap)) {
    const normalized = normalizeUrlKey(rawUrl);
    if (!normalized) continue;
    exact.set(normalized.baseKey + normalized.hash, repoPath);
    base.set(normalized.baseKey, repoPath);
  }

  return { exact, base };
}

function rewriteUrl(urlString, lookup) {
  if (!/^https?:\/\//i.test(urlString)) return null;
  const normalized = normalizeUrlKey(urlString);
  if (!normalized) return null;

  const fullKey = normalized.baseKey + normalized.hash;
  const baseKey = normalized.baseKey;

  if (lookup.exact.has(fullKey)) return lookup.exact.get(fullKey) + normalized.hash;
  if (lookup.base.has(baseKey)) return lookup.base.get(baseKey) + normalized.hash;
  return null;
}

function processReferenceDefinitionLine(line, lookup) {
  // [1]: https://example.com "Title"
  const match =
    /^(\s*\[[^\]]+\]:\s*)(<?)(\S+)(>?)(\s+(?:"[^"]*"|'[^']*'|\([^)]*\)))?\s*$/.exec(
      line,
    );
  if (!match) return null;

  const prefix = match[1] ?? "";
  const open = match[2] ?? "";
  const url = match[3] ?? "";
  const close = match[4] ?? "";
  const suffix = match[5] ?? "";

  const rewritten = rewriteUrl(url, lookup);
  if (!rewritten) return null;

  return `${prefix}${open}${rewritten}${close}${suffix}`.trimEnd();
}

function splitByCodeSpans(line) {
  const parts = [];
  let i = 0;
  let inCode = false;
  let fence = "";
  let current = "";

  while (i < line.length) {
    const ch = line[i];
    if (ch === "`") {
      let j = i;
      while (j < line.length && line[j] === "`") j += 1;
      const ticks = line.slice(i, j);

      if (!inCode) {
        if (current) parts.push({ type: "text", value: current });
        current = ticks;
        inCode = true;
        fence = ticks;
      } else if (ticks === fence) {
        current += ticks;
        parts.push({ type: "code", value: current });
        current = "";
        inCode = false;
        fence = "";
      } else {
        current += ticks;
      }

      i = j;
      continue;
    }

    current += ch;
    i += 1;
  }

  if (current) parts.push({ type: inCode ? "code" : "text", value: current });
  return parts;
}

function rewriteInlineLinksInText(text, lookup) {
  // [label](https://... "title")
  return text.replace(
    /(\]\(\s*)(<?)(https?:\/\/[^)\s>]+)(>?)(\s+(?:"[^"]*"|'[^']*'))?(\s*\))/gi,
    (full, prefix, open, url, close, title = "", suffix) => {
      const rewritten = rewriteUrl(url, lookup);
      if (!rewritten) return full;
      return `${prefix}${open}${rewritten}${close}${title}${suffix}`;
    },
  );
}

function processMarkdown(content, lookup) {
  const lines = content.split(/\r?\n/);
  let inFence = false;
  let fenceMarker = "";

  let changed = false;
  const out = lines.map((line) => {
    const trimmed = line.trimStart();
    const fenceMatch = /^(```+|~~~+)\s*/.exec(trimmed);
    if (fenceMatch) {
      const marker = fenceMatch[1];
      if (!inFence) {
        inFence = true;
        fenceMarker = marker[0];
      } else if (marker[0] === fenceMarker) {
        inFence = false;
        fenceMarker = "";
      }
      return line;
    }

    if (inFence) return line;
    if (/^source:\s*https?:\/\//i.test(line)) return line;

    const refLine = processReferenceDefinitionLine(line, lookup);
    if (refLine && refLine !== line) {
      changed = true;
      return refLine;
    }

    const parts = splitByCodeSpans(line);
    const rewrittenParts = parts.map((part) => {
      if (part.type === "code") return part.value;
      const rewritten = rewriteInlineLinksInText(part.value, lookup);
      if (rewritten !== part.value) changed = true;
      return rewritten;
    });
    return rewrittenParts.join("");
  });

  return { content: out.join("\n"), changed };
}

async function main() {
  const { write, verbose } = parseArgs(process.argv);

  const rawMap = JSON.parse(await fs.readFile(LINK_MAP_PATH, "utf8"));
  const lookup = buildLookup(rawMap);

  const mdFiles = (await listMarkdownFiles(COURSE_ROOT)).sort((a, b) =>
    a.localeCompare(b),
  );

  let totalRewrittenFiles = 0;
  const changedFiles = [];

  for (const mdFile of mdFiles) {
    const original = await fs.readFile(mdFile, "utf8");
    const result = processMarkdown(original, lookup);
    if (!result.changed) continue;

    totalRewrittenFiles += 1;
    changedFiles.push(mdFile);

    if (write) await fs.writeFile(mdFile, result.content, "utf8");
    else if (verbose)
      process.stdout.write(`Would update ${toPosixRelativePath(REPO_ROOT, mdFile)}\n`);
  }

  if (!write) {
    process.stdout.write(
      `Dry-run: ${totalRewrittenFiles} markdown file(s) would be updated.\n`,
    );
    process.stdout.write("Run with --write to apply.\n");
    return;
  }

  process.stdout.write(`Updated ${totalRewrittenFiles} markdown file(s).\n`);
  if (verbose) {
    for (const f of changedFiles) {
      process.stdout.write(`- ${toPosixRelativePath(REPO_ROOT, f)}\n`);
    }
  }
}

await main();

