// Fails when a Markdown document links to a missing file or heading anchor.
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkDocs, listMarkdownFiles } from './lib/docs.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const files = listMarkdownFiles(root);
const problems = checkDocs(root, files);

if (problems.length) {
  console.error(`✗ ${problems.length} broken link(s):\n  ${problems.join('\n  ')}`);
  process.exit(1);
}
console.log(`✓ ${files.length} Markdown files, all relative links resolve`);
