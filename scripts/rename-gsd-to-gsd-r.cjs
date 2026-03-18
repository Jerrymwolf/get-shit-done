#!/usr/bin/env node
'use strict';

/**
 * rename-gsd-to-grd.cjs
 *
 * Renames all GSD references to GRD across the entire project.
 * Must be run from the project root ONCE after cloning upstream.
 *
 * Steps:
 * 1. Rename directories (commands/gsd/ -> commands/grd/, get-shit-done/ -> grd/)
 * 2. Rename agent files (agents/gsd-*.md -> agents/grd-*.md)
 * 3. Rename gsd-tools.cjs -> grd-tools.cjs
 * 4. Perform string replacements across all .md, .cjs, .js files
 *
 * NOTE: This script should only be run once. It is idempotent for
 * directory/file renames (skips if already renamed) but string
 * replacements may double-apply if run twice. The verify-rename.cjs
 * script should be used to confirm correctness.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// Ordered longest-first to avoid partial matches
const REPLACEMENTS = [
  // Build patterns using concatenation so this file itself is not modified
  ['gsd' + '-research-synthesizer', 'grd-research-synthesizer'],
  ['gsd' + '-integration-checker', 'grd-integration-checker'],
  ['gsd' + '-project-researcher', 'grd-project-researcher'],
  ['gsd' + '-phase-researcher', 'grd-phase-researcher'],
  ['gsd' + '-codebase-mapper', 'grd-codebase-mapper'],
  ['gsd' + '-nyquist-auditor', 'grd-nyquist-auditor'],
  ['gsd' + '-plan-checker', 'grd-plan-checker'],
  ['gsd' + '-roadmapper', 'grd-roadmapper'],
  ['gsd' + '-executor', 'grd-executor'],
  ['gsd' + '-debugger', 'grd-debugger'],
  ['gsd' + '-planner', 'grd-planner'],
  ['gsd' + '-verifier', 'grd-verifier'],
  ['gsd' + '-tools.cjs', 'grd-tools.cjs'],
  ['get-shit-done' + '-cc', 'grd'],
  ['gsd' + '_state_version', 'grd_state_version'],
  ['/gsd' + ':', '/grd:'],
  ['commands/gsd' + '/', 'commands/grd/'],
];

function collectFiles(dir, extensions, results = []) {
  const basename = path.basename(dir);
  if (['.planning', '.git', 'node_modules', '.gsd-upstream-temp'].includes(basename)) {
    return results;
  }
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      collectFiles(fullPath, extensions, results);
    } else if (extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

// Protect upstream GitHub URLs from modification
const UPSTREAM_MARKER = '___UPSTREAM_URL___';

function renameContent(content) {
  // Protect upstream URLs
  const upstreamMatches = [];
  const upstreamRe = /gsd-build\/get-shit-done/g;
  let protectedContent = content.replace(upstreamRe, (match) => {
    upstreamMatches.push(match);
    return UPSTREAM_MARKER + (upstreamMatches.length - 1);
  });

  // Apply specific replacements
  for (const [from, to] of REPLACEMENTS) {
    protectedContent = protectedContent.split(from).join(to);
  }

  // Replace generic directory path: get-shit-done -> grd
  // But not if already grd or get-shit-done-cc
  protectedContent = protectedContent.replace(/get-shit-done(?!-r)(?!-cc)/g, 'grd');

  // Restore upstream URLs
  for (let i = 0; i < upstreamMatches.length; i++) {
    protectedContent = protectedContent.split(UPSTREAM_MARKER + i).join(upstreamMatches[i]);
  }

  return protectedContent;
}

console.log('=== GSD to GRD Rename Script ===\n');

// 1. Rename directories
console.log('Step 1: Renaming directories...');

const commandsSrc = path.join(ROOT, 'commands', 'gsd');
const commandsDst = path.join(ROOT, 'commands', 'grd');
if (fs.existsSync(commandsSrc)) {
  fs.renameSync(commandsSrc, commandsDst);
  console.log('  commands/gsd/ -> commands/grd/');
} else if (fs.existsSync(commandsDst)) {
  console.log('  commands/grd/ already exists (skipping)');
} else {
  console.error('  ERROR: neither commands/gsd/ nor commands/grd/ found!');
  process.exit(1);
}

const gsdDir = path.join(ROOT, 'get-shit-done');
const gsdRDir = path.join(ROOT, 'grd');
if (fs.existsSync(gsdDir) && !fs.existsSync(gsdRDir)) {
  fs.renameSync(gsdDir, gsdRDir);
  console.log('  get-shit-done/ -> grd/');
} else if (fs.existsSync(gsdRDir)) {
  console.log('  grd/ already exists (skipping)');
} else {
  console.error('  ERROR: neither get-shit-done/ nor grd/ found!');
  process.exit(1);
}

// 2. Rename agent files
console.log('\nStep 2: Renaming agent files...');
const agentsDir = path.join(ROOT, 'agents');
const agentPrefix = 'gsd' + '-';
const agentFiles = fs.readdirSync(agentsDir).filter(f => f.startsWith(agentPrefix) && !f.startsWith('grd-') && f.endsWith('.md'));
let agentsRenamed = 0;
for (const file of agentFiles) {
  const oldPath = path.join(agentsDir, file);
  const newName = 'grd-' + file.slice(agentPrefix.length);
  const newPath = path.join(agentsDir, newName);
  fs.renameSync(oldPath, newPath);
  console.log('  ' + file + ' -> ' + newName);
  agentsRenamed++;
}
console.log('  Renamed ' + agentsRenamed + ' agent files');

// 3. Rename tools entry point
console.log('\nStep 3: Renaming tools entry point...');
const oldToolsName = 'gsd' + '-tools.cjs';
const oldTools = path.join(ROOT, 'grd', 'bin', oldToolsName);
const newTools = path.join(ROOT, 'grd', 'bin', 'grd-tools.cjs');
if (fs.existsSync(oldTools)) {
  fs.renameSync(oldTools, newTools);
  console.log('  ' + oldToolsName + ' -> grd-tools.cjs');
} else if (fs.existsSync(newTools)) {
  console.log('  grd-tools.cjs already exists (skipping)');
} else {
  console.error('  ERROR: tools entry point not found!');
  process.exit(1);
}

// 4. Perform string replacements
console.log('\nStep 4: Performing string replacements...');
const allFiles = collectFiles(ROOT, ['.md', '.cjs', '.js']);
let filesModified = 0;

for (const filePath of allFiles) {
  const original = fs.readFileSync(filePath, 'utf8');
  const updated = renameContent(original);
  if (original !== updated) {
    fs.writeFileSync(filePath, updated, 'utf8');
    filesModified++;
    console.log('  Modified: ' + path.relative(ROOT, filePath));
  }
}

console.log('\n=== Rename Summary ===');
console.log('Directories renamed: 2');
console.log('Agent files renamed: ' + agentsRenamed);
console.log('Tool file renamed: 1');
console.log('Files with string replacements: ' + filesModified);
console.log('Total files processed: ' + allFiles.length);
console.log('\nDone!');
