const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.join(__dirname, '..');

/**
 * Recursively find files with given extensions.
 * Skips .git, node_modules, and directories starting with '.'
 * (except .planning/ is explicitly included).
 */
function findFiles(dir, extensions, results) {
  results = results || [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === '.git' || entry.name === 'node_modules') continue;
      if (entry.name.startsWith('.') && entry.name !== '.planning') continue;
      findFiles(fullPath, extensions, results);
    } else if (entry.isFile() && extensions.some(ext => entry.name.endsWith(ext))) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Scan directory for files matching pattern, return relative paths of hits.
 */
function scanForPattern(dir, pattern, extensions) {
  const files = findFiles(dir, extensions);
  const hits = [];
  for (const file of files) {
    const content = fs.readFileSync(file, 'utf-8');
    if (pattern.test(content)) {
      hits.push(path.relative(ROOT, file));
    }
  }
  return hits;
}

// Build search patterns from char codes to avoid the bulk rename script
// replacing these literal strings (the test must search for the OLD names).
// g-s-d + hyphen + r
const OLD_PREFIX = String.fromCharCode(103, 115, 100, 45, 114);
// g-e-t + hyphen + s-h-i-t + hyphen + d-o-n-e + hyphen + r
const OLD_LONG = 'get-shit-done' + String.fromCharCode(45, 114);
// g-s-d + underscore + r
const OLD_UNDERSCORE = String.fromCharCode(103, 115, 100, 95, 114);

describe('namespace: zero residual old-namespace references', () => {

  it('no old short prefix in grd/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'grd'), new RegExp(OLD_PREFIX), ['.cjs', '.md', '.js']);
    assert.deepStrictEqual(hits, [], 'Residual old prefix found in: ' + hits.join(', '));
  });

  it('no old long path in grd/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'grd'), new RegExp(OLD_LONG), ['.cjs', '.md', '.js']);
    assert.deepStrictEqual(hits, [], 'Residual old long path found in: ' + hits.join(', '));
  });

  it('no old underscore variant in grd/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'grd'), new RegExp(OLD_UNDERSCORE), ['.cjs', '.md', '.js']);
    assert.deepStrictEqual(hits, [], 'Residual old underscore variant found in: ' + hits.join(', '));
  });

  it('no old short prefix in test/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'test'), new RegExp(OLD_PREFIX), ['.cjs']);
    // Exclude test files that contain patterns as search strings or agent name literals
    const filtered = hits.filter(h =>
      h !== 'test/namespace.test.cjs' && h !== 'test/smoke.test.cjs'
    );
    assert.deepStrictEqual(filtered, [], 'Residual old prefix in tests: ' + filtered.join(', '));
  });

  it('no old long path in .planning/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, '.planning'), new RegExp(OLD_LONG), ['.md', '.json']);
    // Exclude: archived milestones (historical records) and SUMMARY files (describe the rename)
    const filtered = hits.filter(h =>
      !h.startsWith('.planning/milestones/') &&
      !h.endsWith('-SUMMARY.md') &&
      !h.endsWith('-VERIFICATION.md')
    );
    assert.deepStrictEqual(filtered, [], 'Residual old long path in .planning/: ' + filtered.join(', '));
  });

  it('grd/ directory exists', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'grd')), 'grd/ directory must exist');
  });

  it('get-shit-done-r/ directory does not exist', () => {
    assert.ok(!fs.existsSync(path.join(ROOT, OLD_LONG)), OLD_LONG + '/ directory must not exist');
  });

  it('grd-tools.cjs exists', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'grd', 'bin', 'grd-tools.cjs')), 'grd/bin/grd-tools.cjs must exist');
  });

  it('old tools file does not exist', () => {
    assert.ok(!fs.existsSync(path.join(ROOT, 'grd', 'bin', OLD_PREFIX + '-tools.cjs')), 'old tools file must not exist');
  });

});
