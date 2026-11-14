// Check that every URL in the data files and research notes resolves.
// Usage: node build/check-links.mjs   (writes link-report.json, exits 1 on dead links)
// Many news sites refuse automated requests; those show as "blocked", not "dead".

import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const files = [...readdirSync(join(root, 'data')).map((f) => `data/${f}`), 'research/notes.md', 'CONTRIBUTING.md'];
const found = new Map();
for (const file of files)
  for (const m of readFileSync(join(root, file), 'utf8').matchAll(/https?:\/\/[^\s<>"')\]]+/g)) {
    const url = m[0].replace(/[.,;]+$/, '');
    found.set(url, [...(found.get(url) ?? []), file]);
  }

const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
async function check(url) {
  for (const method of ['HEAD', 'GET']) {
    try {
      const res = await fetch(url, {
        method,
        redirect: 'follow',
        headers: { 'user-agent': UA, accept: 'text/html,*/*' },
        signal: AbortSignal.timeout(20000),
      });
      if (res.ok) return { status: res.status, verdict: 'ok' };
      if (method === 'GET') {
        const blocked = [401, 403, 429, 999].includes(res.status) || res.status >= 500;
        return { status: res.status, verdict: blocked ? 'blocked' : 'dead' };
      }
    } catch (e) {
      if (method === 'GET') return { status: e.cause?.code ?? e.name, verdict: 'error' };
    }
  }
}

const urls = [...found.keys()];
const results = [];
for (let i = 0; i < urls.length; i += 8)
  results.push(...(await Promise.all(urls.slice(i, i + 8).map(async (url) => ({ url, files: [...new Set(found.get(url))], ...(await check(url)) })))));

writeFileSync(join(root, 'link-report.json'), JSON.stringify(results, null, 2));
const tally = {};
for (const r of results) tally[r.verdict] = (tally[r.verdict] ?? 0) + 1;
console.log(`${urls.length} URLs:`, tally);
for (const r of results.filter((r) => r.verdict !== 'ok')) console.log(`  ${r.verdict.padEnd(7)} ${r.status}  ${r.url}  (${r.files.join(', ')})`);
process.exit(results.some((r) => r.verdict === 'dead') ? 1 : 0);
