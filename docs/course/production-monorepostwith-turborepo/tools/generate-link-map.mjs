import { promises as fs } from "node:fs";
import path from "node:path";

const REPO_ROOT = process.cwd();
const COURSE_ROOT = path.resolve(
  REPO_ROOT,
  "docs/course/production-monorepostwith-turborepo",
);
const COURSE_ROOT_REL = path
  .relative(REPO_ROOT, COURSE_ROOT)
  .split(path.sep)
  .join("/");

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

function toRepoRootRelativeCoursePath(fileWithinCourseRoot) {
  const relWithinCourse = toPosixRelativePath(COURSE_ROOT, fileWithinCourseRoot);
  return COURSE_ROOT_REL
    ? `${COURSE_ROOT_REL}/${relWithinCourse}`
    : relWithinCourse;
}

function parseSourceUrlFromFirstLine(fileContent) {
  const firstLine = fileContent.split(/\r?\n/, 1)[0] ?? "";
  const match = /^source:\s*(https?:\/\/\S+)\s*$/i.exec(firstLine);
  return match?.[1] ?? null;
}

function parseArgs(argv) {
  const args = { out: null, pretty: true };
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out") {
      args.out = argv[i + 1] ?? null;
      i += 1;
      continue;
    }
    if (arg === "--compact") {
      args.pretty = false;
      continue;
    }
  }
  return args;
}

async function main() {
  const { out, pretty } = parseArgs(process.argv);

  const mdFiles = await listMarkdownFiles(COURSE_ROOT);
  mdFiles.sort((a, b) => a.localeCompare(b));

  const urlToPath = {};
  const duplicates = new Map();
  const missingSource = [];

  for (const mdFile of mdFiles) {
    const repoRel = toRepoRootRelativeCoursePath(mdFile);
    const content = await fs.readFile(mdFile, "utf8");
    const sourceUrl = parseSourceUrlFromFirstLine(content);

    if (!sourceUrl) {
      missingSource.push(repoRel);
      continue;
    }

    const existing = urlToPath[sourceUrl];
    if (existing) {
      const paths = duplicates.get(sourceUrl) ?? [existing];
      paths.push(repoRel);
      duplicates.set(sourceUrl, paths);
      continue;
    }

    urlToPath[sourceUrl] = repoRel;
  }

  if (duplicates.size > 0) {
    const duplicateReport = Object.fromEntries(
      [...duplicates.entries()].sort((a, b) => a[0].localeCompare(b[0])),
    );
    process.stderr.write(
      [
        "Duplicate source URLs found (must be unique):",
        JSON.stringify(duplicateReport, null, 2),
        "",
      ].join("\n"),
    );
    process.exitCode = 2;
    return;
  }

  if (missingSource.length > 0) {
    process.stderr.write(
      [
        "Markdown files without `source:` on the first line (skipped):",
        ...missingSource.sort((a, b) => a.localeCompare(b)).map((p) => `- ${p}`),
        "",
      ].join("\n"),
    );
  }

  const json = pretty
    ? JSON.stringify(urlToPath, null, 2) + "\n"
    : JSON.stringify(urlToPath) + "\n";

  if (out) {
    const outPath = path.resolve(COURSE_ROOT, out);
    await fs.mkdir(path.dirname(outPath), { recursive: true });
    await fs.writeFile(outPath, json, "utf8");
    process.stdout.write(toRepoRootRelativeCoursePath(outPath) + "\n");
    return;
  }

  process.stdout.write(json);
}

await main();

