// Build the static site: read data files, validate them, render pages into dist/.
// Usage: node build/build.mjs [--validate-only]

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { validate } from './schema.mjs';
import { renderSite } from '../src/templates.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (p) => readFileSync(join(root, p), 'utf8');
const loadYaml = (name) => parse(read(`data/${name}.yaml`));

const data = {
  site: loadYaml('site'),
  advice: loadYaml('advice'),
  incidents: loadYaml('incidents'),
  questions: loadYaml('questions'),
  basics: loadYaml('basics'),
  charts: loadYaml('charts'),
};

const errors = validate(data);
if (errors.length) {
  console.error(`Data validation failed with ${errors.length} problem(s):\n`);
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}
console.log(
  `Data valid: ${data.advice.length} advice items, ${data.incidents.length} incidents, ` +
    `${data.questions.length} questions, ${data.basics.length} basics links.`,
);
if (process.argv.includes('--validate-only')) process.exit(0);

const pages = renderSite({
  ...data,
  contributing: read('CONTRIBUTING.md'),
  notes: read('research/notes.md'),
  about: read('ABOUT.md'),
  builtOn: new Date().toISOString().slice(0, 10),
});

const dist = join(root, 'dist');
rmSync(dist, { recursive: true, force: true });
for (const [path, html] of Object.entries(pages)) {
  const file = join(dist, path);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, html);
}
cpSync(join(root, 'src/static'), dist, { recursive: true });
console.log(`Built ${Object.keys(pages).length} pages into dist/`);
