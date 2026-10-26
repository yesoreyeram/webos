import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  checkDocs,
  collectAnchors,
  extractMermaidBlocks,
  findRelativeLinks,
  listMarkdownFiles,
  proseLines,
  slugify,
} from '../../scripts/lib/docs.mjs';

describe('slugify', () => {
  it.each([
    ['3.1 Dependency rules', '31-dependency-rules'],
    ['5. Content Security Policy and browser hardening', '5-content-security-policy-and-browser-hardening'],
    ['4. Enabling Google sign-in (optional)', '4-enabling-google-sign-in-optional'],
    ['ADR-0001: Client-only static architecture', 'adr-0001-client-only-static-architecture'],
    ['Keep snake_case', 'keep-snake_case'],
    ['Link [inside](x.md) heading', 'link-inside-heading'],
  ])('%s → %s', (heading, slug) => {
    expect(slugify(heading)).toBe(slug);
  });
});

describe('proseLines', () => {
  it('skips fenced code blocks and keeps line numbers', () => {
    const md = 'a\n```\n[x](missing.md)\n```\nb';
    expect(proseLines(md)).toEqual([
      { text: 'a', line: 1 },
      { text: 'b', line: 5 },
    ]);
  });
});

describe('collectAnchors', () => {
  it('collects headings and suffixes duplicates like GitHub', () => {
    const anchors = collectAnchors('# Title\n## Setup\ntext\n## Setup\n```\n# not a heading\n```');
    expect([...anchors]).toEqual(['title', 'setup', 'setup-1']);
  });
});

describe('extractMermaidBlocks', () => {
  it('returns code and starting line of each mermaid block', () => {
    const md = 'intro\n```mermaid\nflowchart LR\n  a --> b\n```\n```js\nx\n```\n```mermaid\nerDiagram\n```';
    expect(extractMermaidBlocks(md)).toEqual([
      { code: 'flowchart LR\n  a --> b', line: 2 },
      { code: 'erDiagram', line: 9 },
    ]);
  });

  it('throws on an unterminated block', () => {
    expect(() => extractMermaidBlocks('```mermaid\nflowchart LR')).toThrow(/line 1/);
  });
});

describe('findRelativeLinks', () => {
  it('finds relative links and images but ignores URLs and code', () => {
    const md = [
      'See [docs](docs/A.md#intro) and ![shot](img/a.png "title").',
      'External [site](https://example.com) and [mail](mailto:a@b.c).',
      '`[inline](ignored.md)` is still prose, so it is found.',
      '```',
      '[fenced](skip.md)',
      '```',
      'Anchor only [here](#top).',
    ].join('\n');
    expect(findRelativeLinks(md).map((l) => l.href)).toEqual(['docs/A.md#intro', 'img/a.png', 'ignored.md', '#top']);
  });
});

describe('checkDocs', () => {
  function fixture() {
    const root = mkdtempSync(join(tmpdir(), 'webos-docs-'));
    mkdirSync(join(root, 'docs'));
    mkdirSync(join(root, 'node_modules'));
    writeFileSync(join(root, 'node_modules', 'ignored.md'), '[bad](nope.md)');
    writeFileSync(join(root, 'docs', 'guide.md'), '# Guide\n## Install steps\n');
    writeFileSync(join(root, 'docs', 'pic.png'), '');
    return root;
  }

  it('passes when files and anchors exist, and ignores node_modules', () => {
    const root = fixture();
    writeFileSync(join(root, 'README.md'), '# Top\n[g](docs/guide.md#install-steps) ![p](docs/pic.png) [t](#top)');
    expect(listMarkdownFiles(root)).toHaveLength(2);
    expect(checkDocs(root)).toEqual([]);
  });

  it('reports missing files and anchors with file:line', () => {
    const root = fixture();
    writeFileSync(join(root, 'README.md'), '# Top\n[a](docs/missing.md)\n[b](docs/guide.md#nope)\n[c](#absent)');
    expect(checkDocs(root)).toEqual([
      'README.md:2 → missing file: docs/missing.md',
      'README.md:3 → missing anchor: docs/guide.md#nope',
      'README.md:4 → missing anchor: #absent',
    ]);
  });
});
