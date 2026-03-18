#!/usr/bin/env node
/**
 * Bulk namespace rename for .planning/ directory
 * Applies gsd-r -> grd replacements to all planning docs except milestones/
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

const REPLACEMENTS = [
  ['get-shit-done-r', 'grd'],
  ['gsd-r-tools.cjs', 'grd-tools.cjs'],
  ['gsd-r-', 'grd-'],
  ['gsd-r:', 'grd:'],
  ['gsd-r', 'grd'],
  ['GSD-R', 'GRD'],
  ['gsd_r', 'grd'],
];

function findFiles(dir, extensions, results) {
  results = results || [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      // Skip milestones (historical records)
      if (entry.name === 'milestones') continue;
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      findFiles(fullPath, extensions, results);
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

function applyReplacements(content) {
  let result = content;
  for (const [from, to] of REPLACEMENTS) {
    result = result.split(from).join(to);
  }
  return result;
}

const planningDir = path.join(ROOT, '.planning');
const files = findFiles(planningDir, ['.md', '.json']);

let filesChanged = 0;
for (const file of files) {
  const original = fs.readFileSync(file, 'utf-8');
  const updated = applyReplacements(original);
  if (original !== updated) {
    fs.writeFileSync(file, updated, 'utf-8');
    filesChanged++;
    console.log('Updated:', path.relative(ROOT, file));
  }
}

console.log(`\nDone: ${filesChanged} files updated in .planning/`);
