import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ICON_NAMES, extractInner } from '../../scripts/build-prototype-icons.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const protoDir = join(root, 'docs', 'prototypes');
const screens = JSON.parse(readFileSync(join(protoDir, 'src', 'screens.json'), 'utf8'));

describe('extractInner', () => {
  it('returns the SVG children without whitespace between elements', () => {
    const svg = '<!-- c -->\n<svg class="x" viewBox="0 0 24 24">\n  <path d="M1 1" />\n  <circle r="2" />\n</svg>';
    expect(extractInner(svg)).toBe('<path d="M1 1" /><circle r="2" />');
  });

  it('rejects non-SVG input', () => {
    expect(() => extractInner('<div></div>')).toThrow('Not an SVG document');
  });
});

describe('prototype manifest', () => {
  it('has 13 uniquely numbered screens', () => {
    expect(screens).toHaveLength(13);
    const ids = screens.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id, i) => expect(id.startsWith(String(i + 1).padStart(2, '0'))).toBe(true));
  });

  it.each(screens.map((s) => [s.id, s]))('%s has a source file, a rendered PNG and a title', (_id, s) => {
    expect(existsSync(join(protoDir, 'src', s.file))).toBe(true);
    expect(existsSync(join(protoDir, `${s.id}.png`))).toBe(true);
    expect(s.title.length).toBeGreaterThan(3);
  });

  it('renders every PNG at 1440×900', () => {
    for (const s of screens) {
      const png = readFileSync(join(protoDir, `${s.id}.png`));
      expect(png.subarray(1, 4).toString()).toBe('PNG');
      expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([1440, 900]);
    }
  });
});

describe('icon sprite', () => {
  const sprite = readFileSync(join(protoDir, 'src', 'shared', 'icons.js'), 'utf8');
  const icons = JSON.parse(sprite.slice(sprite.indexOf('{'), sprite.lastIndexOf('}') + 1));

  it('is up to date with the icon list', () => {
    expect(Object.keys(icons).sort()).toEqual([...ICON_NAMES].sort());
  });

  it('contains every icon used by the prototypes', () => {
    const used = new Set();
    const sources = screens.map((s) => s.file).concat(['shared/shell.js']);
    for (const file of new Set(sources)) {
      const text = readFileSync(join(protoDir, 'src', file), 'utf8');
      for (const m of text.matchAll(/data-icon="([a-z0-9-]+)"|icon\('([a-z0-9-]+)'/g)) used.add(m[1] || m[2]);
    }
    const missing = [...used].filter((name) => !(name in icons));
    expect(missing).toEqual([]);
  });
});
