import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { extractMermaidBlocks, listMarkdownFiles } from '../../scripts/lib/docs.mjs';

const require = createRequire(import.meta.url);
const screens = JSON.parse(readFileSync(new URL('../../docs/prototypes/src/screens.json', import.meta.url), 'utf8'));

function trackErrors(page) {
  const errors = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('requestfailed', (req) => errors.push(`Request failed: ${req.url()}`));
  return errors;
}

test.describe('prototype gallery', () => {
  test('lists every screen with a loaded image and a link to its HTML source', async ({ page }) => {
    const errors = trackErrors(page);
    await page.goto('/index.html');
    await page.waitForFunction(() => window.__galleryReady === true);

    const figures = page.locator('figure');
    await expect(figures).toHaveCount(screens.length);
    for (const [i, s] of screens.entries()) {
      const fig = figures.nth(i);
      await expect(fig.locator('b')).toHaveText(s.title);
      await expect(fig.getByRole('link', { name: 'Open HTML' })).toHaveAttribute('href', `src/${s.file}${s.query || ''}`);
      const img = fig.locator('img');
      await img.scrollIntoViewIfNeeded();
      await expect.poll(() => img.evaluate((el) => el.complete && el.naturalWidth)).toBe(1440);
    }
    expect(errors).toEqual([]);
  });
});

test.describe('prototype screens', () => {
  for (const s of screens) {
    test(`${s.id} renders cleanly and passes accessibility checks`, async ({ page }) => {
      const errors = trackErrors(page);
      await page.goto(`/src/${s.file}${s.query || ''}`);
      await page.waitForFunction(() => window.__protoReady === true);

      // All icon/tile placeholders were hydrated and every image decoded.
      await expect(page.locator('i[data-icon], i[data-tile]')).toHaveCount(0);
      const broken = await page.$$eval('img', (imgs) => imgs.filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src));
      expect(broken).toEqual([]);

      // The 1440×900 canvas never overflows horizontally.
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scrollWidth).toBeLessThanOrEqual(1440);

      if (s.query?.includes('theme=dark')) {
        await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      }

      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
      const serious = results.violations
        .filter((v) => v.impact === 'serious' || v.impact === 'critical')
        .map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 5).join(', ')}`);
      expect(serious).toEqual([]);
      expect(errors).toEqual([]);
    });
  }
});

test.describe('architecture diagrams', () => {
  const root = new URL('../..', import.meta.url).pathname;
  const blocks = listMarkdownFiles(root).flatMap((file) =>
    extractMermaidBlocks(readFileSync(file, 'utf8')).map((b) => ({ ...b, file: file.slice(root.length) })),
  );

  test('documentation contains Mermaid diagrams', () => {
    expect(blocks.length).toBeGreaterThanOrEqual(8);
  });

  test('every Mermaid diagram parses', async ({ page }) => {
    await page.goto('about:blank');
    await page.addScriptTag({ path: require.resolve('mermaid/dist/mermaid.min.js') });
    const failures = await page.evaluate(async (items) => {
      window.mermaid.initialize({ startOnLoad: false });
      const out = [];
      for (const { code, file, line } of items) {
        try {
          await window.mermaid.parse(code);
        } catch (err) {
          out.push(`${file}:${line} ${String(err.message || err).split('\n')[0]}`);
        }
      }
      return out;
    }, blocks);
    expect(failures).toEqual([]);
  });
});
