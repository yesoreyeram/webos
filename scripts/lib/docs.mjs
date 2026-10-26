// Helpers for validating Markdown documentation: fenced-block parsing,
// GitHub-compatible heading slugs, and relative link/anchor checks.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, relative, resolve } from 'node:path';

const FENCE = /^\s*(```|~~~)/;
const IGNORED_DIRS = new Set(['node_modules', '.git', 'playwright-report', 'test-results', 'coverage', 'dist']);

/** Returns the lines of a Markdown document that are outside fenced code blocks, with 1-based line numbers. */
export function proseLines(markdown) {
  const out = [];
  let inFence = false;
  markdown.split('\n').forEach((text, i) => {
    if (FENCE.test(text)) {
      inFence = !inFence;
      return;
    }
    if (!inFence) out.push({ text, line: i + 1 });
  });
  return out;
}

/** Extracts ```mermaid fenced blocks. */
export function extractMermaidBlocks(markdown) {
  const blocks = [];
  let current = null;
  markdown.split('\n').forEach((text, i) => {
    if (current) {
      if (/^\s*```\s*$/.test(text)) {
        blocks.push({ code: current.lines.join('\n'), line: current.line });
        current = null;
      } else {
        current.lines.push(text);
      }
    } else if (/^\s*```mermaid\s*$/.test(text)) {
      current = { line: i + 1, lines: [] };
    }
  });
  if (current) throw new Error(`Unterminated mermaid block starting at line ${current.line}`);
  return blocks;
}

/** GitHub-style heading anchor slug. */
export function slugify(heading) {
  return heading
    .trim()
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
    .replace(/ /g, '-');
}

/** Set of anchors defined by ATX headings (with GitHub's -1, -2 suffixes for duplicates). */
export function collectAnchors(markdown) {
  const anchors = new Set();
  const seen = new Map();
  for (const { text } of proseLines(markdown)) {
    const m = text.match(/^#{1,6}\s+(.+?)\s*#*\s*$/);
    if (!m) continue;
    const base = slugify(m[1]);
    const n = seen.get(base) ?? 0;
    anchors.add(n === 0 ? base : `${base}-${n}`);
    seen.set(base, n + 1);
  }
  return anchors;
}

/** Relative links and images (external URLs and mailto are ignored). */
export function findRelativeLinks(markdown) {
  const links = [];
  const re = /!?\[[^\]]*\]\(\s*<?([^)\s>]+)>?(?:\s+"[^"]*")?\s*\)/g;
  for (const { text, line } of proseLines(markdown)) {
    for (const m of text.matchAll(re)) {
      const href = m[1];
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
      links.push({ href, line });
    }
  }
  return links;
}

/** Recursively lists Markdown files under a directory. */
export function listMarkdownFiles(dir) {
  const files = [];
  for (const name of readdirSync(dir)) {
    if (IGNORED_DIRS.has(name)) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) files.push(...listMarkdownFiles(full));
    else if (extname(name) === '.md') files.push(full);
  }
  return files;
}

/** Validates every relative link (file existence + Markdown anchors). Returns a list of problems. */
export function checkDocs(rootDir, files = listMarkdownFiles(rootDir)) {
  const problems = [];
  const anchorCache = new Map();
  const anchorsOf = (file) => {
    if (!anchorCache.has(file)) anchorCache.set(file, collectAnchors(readFileSync(file, 'utf8')));
    return anchorCache.get(file);
  };

  for (const file of files) {
    const markdown = readFileSync(file, 'utf8');
    for (const { href, line } of findRelativeLinks(markdown)) {
      const [pathPart, anchor] = href.split('#');
      const target = pathPart ? resolve(dirname(file), decodeURIComponent(pathPart)) : file;
      const where = `${relative(rootDir, file)}:${line}`;
      if (!existsSync(target)) {
        problems.push(`${where} → missing file: ${href}`);
        continue;
      }
      if (anchor && extname(target) === '.md' && !anchorsOf(target).has(anchor)) {
        problems.push(`${where} → missing anchor: ${href}`);
      }
    }
  }
  return problems;
}
