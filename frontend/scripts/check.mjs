import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildGuide, fillTemplate, checkSite } from './content.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const template = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const guide = buildGuide(root);
const issues = checkSite(template, guide, path.join(root, 'public'));
const sizes = guide.pages.map((p) => fillTemplate(template, guide, p.id).length);
const { parts, sections, pages, images, videos } = guide.stats;
console.log(`Guide: ${pages} pages (${parts} parts, ${sections} sections), ${images} screenshots, ${videos} videos`);
console.log(`Page size: ${Math.round(Math.min(...sizes) / 1024)}–${Math.round(Math.max(...sizes) / 1024)} KB of HTML; search index ${Math.round(JSON.stringify(guide.searchIndex).length / 1024)} KB`);
if (issues.length) {
  console.error(`\n${issues.length} problem(s):\n  ${issues.join('\n  ')}`);
  process.exit(1);
}
console.log('All checks passed: one h1 per page, ids unique, links resolve, files exist, tags balanced, encoding clean.');
