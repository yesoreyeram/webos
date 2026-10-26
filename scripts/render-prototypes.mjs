// Renders every prototype in docs/prototypes/src to a PNG in docs/prototypes/.
// Usage: node scripts/render-prototypes.mjs [screen-id ...]
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from '@playwright/test';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const srcDir = join(root, 'docs/prototypes/src');
const outDir = join(root, 'docs/prototypes');
const screens = JSON.parse(readFileSync(join(srcDir, 'screens.json'), 'utf8'));

const only = process.argv.slice(2);
const selected = only.length ? screens.filter((s) => only.includes(s.id)) : screens;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
let failures = 0;

for (const screen of selected) {
  const page = await context.newPage();
  const errors = [];
  page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()));
  page.on('pageerror', (err) => errors.push(err.message));

  const url = pathToFileURL(join(srcDir, screen.file)).href + (screen.query || '');
  await page.goto(url);
  await page.waitForFunction(() => window.__protoReady === true, null, { timeout: 10_000 });
  await page.screenshot({ path: join(outDir, `${screen.id}.png`), clip: { x: 0, y: 0, width: 1440, height: 900 } });
  await page.close();

  if (errors.length) {
    failures++;
    console.error(`✗ ${screen.id}\n  ${errors.join('\n  ')}`);
  } else {
    console.log(`✓ ${screen.id}`);
  }
}

await browser.close();
if (failures) process.exit(1);
