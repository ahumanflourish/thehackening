// Checks on the built site. Run after `npm run build` (npm test does both).
// Fails if a page is missing, an internal link is broken, or the no-script rules are violated.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const fail = [];
const walk = (dir) => readdirSync(dir).flatMap((f) => { const p = join(dir, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const pages = walk(dist).filter((f) => f.endsWith('.html'));
const yaml = (name) => parse(readFileSync(join(root, 'data', `${name}.yaml`), 'utf8'));

// 1. Every expected page exists.
const advice = yaml('advice');
const expected = ['index.html', 'incidents/index.html', 'questions/index.html', 'checklist/index.html', 'basics/index.html', 'contribute/index.html', 'about/index.html', 'notes/index.html', '404.html', ...advice.map((a) => `do/${a.id}/index.html`)];
for (const p of expected) if (!existsSync(join(dist, p))) fail.push(`missing page: ${p}`);

for (const file of pages) {
  const rel = file.slice(dist.length);
  const html = readFileSync(file, 'utf8');
  // 2. No scripts, inline styles or event handlers: the Content-Security-Policy forbids them.
  if (/<script\b/i.test(html)) fail.push(`${rel}: contains a <script> tag`);
  if (/\sstyle\s*=\s*["']/i.test(html)) fail.push(`${rel}: contains an inline style attribute`);
  if (/\son[a-z]+\s*=\s*["']/i.test(html)) fail.push(`${rel}: contains an inline event handler`);
  // 3. No third-party resources.
  for (const m of html.matchAll(/<(?:link|img|source|iframe)\b[^>]*?(?:href|src)="(https?:[^"]+)"/gi)) fail.push(`${rel}: loads an outside resource ${m[1]}`);
  // 4. Internal links and anchors resolve.
  const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
  for (const m of html.matchAll(/\shref="([^"]+)"/g)) {
    const href = m[1].replace(/&amp;/g, '&');
    if (/^(https?:|mailto:)/.test(href)) continue;
    const [path, hash] = href.split('#');
    if (!path) { if (hash && !ids.has(hash)) fail.push(`${rel}: link to missing anchor #${hash}`); continue; }
    const target = join(dist, path.endsWith('/') ? `${path}index.html` : path);
    if (!existsSync(target)) { fail.push(`${rel}: broken internal link ${href}`); continue; }
    if (hash && target.endsWith('.html') && !new RegExp(`\\sid="${hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"`).test(readFileSync(target, 'utf8'))) fail.push(`${rel}: link to missing anchor ${href}`);
  }
  // 5. Pop-up buttons point at a pop-up on the same page; ids are unique.
  for (const m of html.matchAll(/popovertarget="([^"]+)"/g)) if (!ids.has(m[1])) fail.push(`${rel}: pop-up button with no target #${m[1]}`);
  const seen = new Set();
  for (const m of html.matchAll(/\sid="([^"]+)"/g)) { if (seen.has(m[1])) fail.push(`${rel}: duplicate id ${m[1]}`); seen.add(m[1]); }
  // 6. Every page has a title and the sitewide notice.
  if (!/<title>[^<]+<\/title>/.test(html)) fail.push(`${rel}: no <title>`);
  if (!html.includes('class="notice"')) fail.push(`${rel}: sitewide notice missing`);
}

// 7. The ranked list is a clean sequence and every action has a guide with steps.
const actions = advice.filter((a) => a.kind === 'action').sort((a, b) => a.rank - b.rank);
actions.forEach((a, i) => { if (a.rank !== i + 1) fail.push(`advice.yaml › ${a.id}: rank ${a.rank} breaks the sequence (expected ${i + 1})`); });
for (const a of actions) if (!a.steps?.length) fail.push(`advice.yaml › ${a.id}: action has no steps`);
for (let i = 1; i < actions.length; i++) if (actions[i].tier < actions[i - 1].tier) fail.push(`advice.yaml › ${actions[i].id}: ranked after a later group`);

if (fail.length) {
  console.error(`Site checks failed with ${fail.length} problem(s):\n`);
  for (const f of [...new Set(fail)].slice(0, 60)) console.error(`  - ${f}`);
  process.exit(1);
}
console.log(`Site checks passed: ${pages.length} pages, ${actions.length} steps in order, no scripts, no broken internal links.`);
