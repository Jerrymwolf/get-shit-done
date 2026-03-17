#!/usr/bin/env node
'use strict';

/**
 * verify-rename.cjs
 *
 * Verifies that all GSD->GSD-R renames were applied correctly.
 * Greps for stale references that should have been renamed.
 * Exits 0 if clean, 1 if stale references found.
 *
 * NOTE: This script uses hex-encoded patterns to avoid being modified
 * by the rename script itself.
 */

const fs = require('fs');
const path = require('path');

const ROOT = process.cwd();

// Directories to scan
const SCAN_DIRS = ['commands', 'agents', 'get-shit-done-r', 'bin'];

// File extensions to check
const EXTENSIONS = ['.md', '.cjs', '.js'];

// Files to exclude from checking
const EXCLUDE_BASENAMES = ['LICENSE', 'verify-rename.cjs', 'rename-gsd-to-gsd-r.cjs', 'install.js'];

function collectFiles(dir, extensions, results = []) {
  if (!fs.existsSync(dir)) return results;
  const basename = path.basename(dir);
  if (['.planning', '.git', 'node_modules'].includes(basename)) return results;

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

function isExcluded(filePath) {
  return EXCLUDE_BASENAMES.includes(path.basename(filePath));
}

function isUpstreamUrlLine(line) {
  // Lines referencing the upstream GitHub repo should be excluded
  return line.includes('gsd-build') ||
         line.includes('github.com') && line.includes('get-shit-done') ||
         line.includes('npmjs.com');
}

const issues = [];

console.log('=== GSD-R Rename Verification ===\n');

// Collect all files to scan
let allFiles = [];
for (const dir of SCAN_DIRS) {
  collectFiles(path.join(ROOT, dir), EXTENSIONS, allFiles);
}
// Also scan scripts/ excluding our own
const scriptsDir = path.join(ROOT, 'scripts');
if (fs.existsSync(scriptsDir)) {
  collectFiles(scriptsDir, EXTENSIONS, allFiles);
}

console.log('Scanning ' + allFiles.length + ' files...\n');

// --- Stale pattern checks ---
// We look for patterns that should NOT exist anymore after rename.
// The OLD (stale) patterns are the ones WITHOUT '-r'.

// Stale agent names: these are agent names that should have been renamed to gsd-r-*
// We check: line contains e.g. "gsd-executor" but NOT as part of "gsd-r-executor"
const OLD_AGENT_NAMES = [
  'executor', 'planner', 'phase-researcher', 'project-researcher',
  'plan-checker', 'verifier', 'roadmapper', 'research-synthesizer',
  'codebase-mapper', 'debugger', 'integration-checker', 'nyquist-auditor',
];

for (const filePath of allFiles) {
  if (isExcluded(filePath)) continue;

  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const relPath = path.relative(ROOT, filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNum = i + 1;

    // Skip upstream URL lines
    if (isUpstreamUrlLine(line)) continue;

    // Check 1: Stale /gsd: command references (should be /gsd-r:)
    // Look for /gsd: that is NOT /gsd-r:
    const slashGsdMatches = line.match(/\/gsd(?!-r):/g);
    if (slashGsdMatches) {
      issues.push({
        file: relPath,
        line: lineNum,
        type: 'stale /gsd: reference',
        text: line.trim().substring(0, 120),
      });
    }

    // Check 2: Stale gsd-tools.cjs (should be gsd-r-tools.cjs)
    // Match gsd-tools.cjs but NOT gsd-r-tools.cjs
    if (/(?<!r-)gsd-tools\.cjs/.test(line)) {
      issues.push({
        file: relPath,
        line: lineNum,
        type: 'stale gsd-tools.cjs reference',
        text: line.trim().substring(0, 120),
      });
    }

    // Check 3: Stale get-shit-done directory paths (should be get-shit-done-r)
    // Match get-shit-done that is NOT followed by -r or -cc
    // Also not inside URLs to upstream
    if (/get-shit-done(?!-r)(?!-cc)/.test(line)) {
      issues.push({
        file: relPath,
        line: lineNum,
        type: 'stale get-shit-done path',
        text: line.trim().substring(0, 120),
      });
    }

    // Check 4: Stale agent names -- gsd-NAME but NOT gsd-r-NAME
    for (const suffix of OLD_AGENT_NAMES) {
      // Build pattern: "gsd-" + suffix but NOT preceded by context making it "gsd-r-"
      const pattern = new RegExp('gsd-' + suffix.replace(/-/g, '\\-'));
      if (pattern.test(line)) {
        // Make sure it's not already the renamed version gsd-r-suffix
        const renamedPattern = new RegExp('gsd-r-' + suffix.replace(/-/g, '\\-'));
        // Count old occurrences vs renamed occurrences
        const oldMatches = line.match(new RegExp('gsd-' + suffix.replace(/-/g, '\\-'), 'g')) || [];
        const newMatches = line.match(new RegExp('gsd-r-' + suffix.replace(/-/g, '\\-'), 'g')) || [];
        // If all old matches are accounted for by new matches, it's fine
        if (oldMatches.length > newMatches.length) {
          issues.push({
            file: relPath,
            line: lineNum,
            type: 'stale agent name: gsd-' + suffix,
            text: line.trim().substring(0, 120),
          });
        }
      }
    }

    // Check 5: Stale gsd_state_version (should be gsd_r_state_version)
    if (/gsd_state_version/.test(line) && !/gsd_r_state_version/.test(line)) {
      issues.push({
        file: relPath,
        line: lineNum,
        type: 'stale gsd_state_version',
        text: line.trim().substring(0, 120),
      });
    }

    // Check 6: Stale commands/gsd/ directory reference (should be commands/gsd-r/)
    if (/commands\/gsd(?!-r)\//.test(line)) {
      issues.push({
        file: relPath,
        line: lineNum,
        type: 'stale commands/gsd/ reference',
        text: line.trim().substring(0, 120),
      });
    }

    // Check 7: Stale $HOME path references (should be absolute paths)
    if (/\$HOME\/\.claude/.test(line)) {
      issues.push({
        file: relPath,
        line: lineNum,
        type: 'stale $HOME path reference',
        text: line.trim().substring(0, 120),
      });
    }

    // Check 8: Stale ~ path references (should be absolute paths)
    if (/~\/\.claude/.test(line)) {
      issues.push({
        file: relPath,
        line: lineNum,
        type: 'stale ~ path reference',
        text: line.trim().substring(0, 120),
      });
    }
  }
}

// Check structural expectations
console.log('Checking directory structure...');

if (!fs.existsSync(path.join(ROOT, 'commands', 'gsd-r'))) {
  issues.push({ file: 'commands/gsd-r', line: 0, type: 'missing directory', text: 'commands/gsd-r/ not found' });
}
if (!fs.existsSync(path.join(ROOT, 'get-shit-done-r', 'bin'))) {
  issues.push({ file: 'get-shit-done-r/bin', line: 0, type: 'missing directory', text: 'get-shit-done-r/bin/ not found' });
}
if (fs.existsSync(path.join(ROOT, 'commands', 'gsd'))) {
  issues.push({ file: 'commands/gsd', line: 0, type: 'unrenamed directory', text: 'Old commands/gsd/ still exists' });
}
if (fs.existsSync(path.join(ROOT, 'get-shit-done')) && !fs.existsSync(path.join(ROOT, 'get-shit-done-r'))) {
  issues.push({ file: 'get-shit-done', line: 0, type: 'unrenamed directory', text: 'Old get-shit-done/ still exists without get-shit-done-r/' });
}
if (!fs.existsSync(path.join(ROOT, 'get-shit-done-r', 'bin', 'gsd-r-tools.cjs'))) {
  issues.push({ file: 'get-shit-done-r/bin/gsd-r-tools.cjs', line: 0, type: 'missing file', text: 'gsd-r-tools.cjs not found' });
}

// Check agent files are renamed
const agentFiles = fs.readdirSync(path.join(ROOT, 'agents')).filter(f => f.endsWith('.md'));
const staleAgentFiles = agentFiles.filter(f => f.startsWith('gsd-') && !f.startsWith('gsd-r-'));
for (const f of staleAgentFiles) {
  issues.push({ file: 'agents/' + f, line: 0, type: 'unrenamed agent file', text: 'Agent file not renamed to gsd-r-*' });
}

// Report
console.log('');
if (issues.length === 0) {
  console.log('PASS: No stale GSD references found. Rename is clean.');
  process.exit(0);
} else {
  console.log('FAIL: Found ' + issues.length + ' stale references:\n');
  // Deduplicate by file+line to reduce noise
  const seen = new Set();
  for (const issue of issues) {
    const key = issue.file + ':' + issue.line + ':' + issue.type;
    if (seen.has(key)) continue;
    seen.add(key);
    console.log('  [' + issue.type + '] ' + issue.file + ':' + issue.line);
    if (issue.text) console.log('    ' + issue.text);
  }
  process.exit(1);
}
