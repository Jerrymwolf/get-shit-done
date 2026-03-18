#!/usr/bin/env node
/**
 * Bulk namespace rename: grd -> grd
 * Applies replacements in strict order to avoid partial matches.
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');

// Replacement pairs IN ORDER (longest/most specific first)
const REPLACEMENTS = [
  ['grd', 'grd'],
  ['grd-tools.cjs', 'grd-tools.cjs'],
  ['grd-', 'grd-'],
  ['grd:', 'grd:'],
  ['grd', 'grd'],
  ['GRD', 'GRD'],
  ['grd', 'grd'],
];

function findFiles(dir, extensions, results) {
  results = results || [];
  if (!fs.existsSync(dir)) return results;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
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

// Collect all files to process
const filesToProcess = [];

// grd/bin/*.cjs and grd/bin/lib/*.cjs
filesToProcess.push(...findFiles(path.join(ROOT, 'grd', 'bin'), ['.cjs']));

// grd/workflows/*.md, grd/references/*.md, grd/templates/*.md
filesToProcess.push(...findFiles(path.join(ROOT, 'grd', 'workflows'), ['.md']));
filesToProcess.push(...findFiles(path.join(ROOT, 'grd', 'references'), ['.md']));
filesToProcess.push(...findFiles(path.join(ROOT, 'grd', 'templates'), ['.md']));

// grd/agents/*.md (if exists)
filesToProcess.push(...findFiles(path.join(ROOT, 'grd', 'agents'), ['.md']));

// test/*.test.cjs
filesToProcess.push(...findFiles(path.join(ROOT, 'test'), ['.cjs']));

// .planning/config.json
const configPath = path.join(ROOT, '.planning', 'config.json');
if (fs.existsSync(configPath)) filesToProcess.push(configPath);

// CLAUDE.md (if exists)
const claudePath = path.join(ROOT, 'CLAUDE.md');
if (fs.existsSync(claudePath)) filesToProcess.push(claudePath);

// .planning/phases/17-namespace-migration/17-CONTEXT.md and 17-RESEARCH.md
const phase17Dir = path.join(ROOT, '.planning', 'phases', '17-namespace-migration');
for (const f of ['17-CONTEXT.md', '17-RESEARCH.md']) {
  const p = path.join(phase17Dir, f);
  if (fs.existsSync(p)) filesToProcess.push(p);
}

// scripts/*.cjs (includes verify-rename.cjs etc)
filesToProcess.push(...findFiles(path.join(ROOT, 'scripts'), ['.cjs', '.js']));

// grd/VERSION (plain text, no extension filter needed)
const versionPath = path.join(ROOT, 'grd', 'VERSION');
if (fs.existsSync(versionPath)) filesToProcess.push(versionPath);

let totalChanges = 0;
let filesChanged = 0;

for (const file of filesToProcess) {
  const original = fs.readFileSync(file, 'utf-8');
  const updated = applyReplacements(original);
  if (original !== updated) {
    fs.writeFileSync(file, updated, 'utf-8');
    filesChanged++;
    // Count occurrences changed
    for (const [from] of REPLACEMENTS) {
      const re = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const matches = original.match(re);
      if (matches) totalChanges += matches.length;
    }
    console.log('Updated:', path.relative(ROOT, file));
  }
}

console.log(`\nDone: ${filesChanged} files updated, ~${totalChanges} replacements`);
