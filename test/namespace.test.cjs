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

describe('namespace: zero residual gsd-r references', () => {

  it('no "gsd-r" in grd/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'grd'), /gsd-r/, ['.cjs', '.md', '.js']);
    assert.deepStrictEqual(hits, [], 'Residual gsd-r found in: ' + hits.join(', '));
  });

  it('no "get-shit-done-r" in grd/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'grd'), /get-shit-done-r/, ['.cjs', '.md', '.js']);
    assert.deepStrictEqual(hits, [], 'Residual get-shit-done-r found in: ' + hits.join(', '));
  });

  it('no "gsd_r" in grd/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'grd'), /gsd_r/, ['.cjs', '.md', '.js']);
    assert.deepStrictEqual(hits, [], 'Residual gsd_r found in: ' + hits.join(', '));
  });

  it('no "gsd-r" in test/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, 'test'), /gsd-r/, ['.cjs']);
    // Exclude this test file itself (it contains patterns as search strings)
    const filtered = hits.filter(h => h !== 'test/namespace.test.cjs');
    assert.deepStrictEqual(filtered, [], 'Residual gsd-r in tests: ' + filtered.join(', '));
  });

  it('no "get-shit-done-r" in .planning/ tree', () => {
    const hits = scanForPattern(path.join(ROOT, '.planning'), /get-shit-done-r/, ['.md', '.json']);
    // Exclude files under .planning/milestones/ (historical records)
    const filtered = hits.filter(h => !h.startsWith('planning/milestones/') && !h.startsWith('.planning/milestones/'));
    assert.deepStrictEqual(filtered, [], 'Residual get-shit-done-r in .planning/: ' + filtered.join(', '));
  });

  it('grd/ directory exists', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'grd')), 'grd/ directory must exist');
  });

  it('get-shit-done-r/ directory does not exist', () => {
    assert.ok(!fs.existsSync(path.join(ROOT, 'get-shit-done-r')), 'get-shit-done-r/ directory must not exist');
  });

  it('grd-tools.cjs exists', () => {
    assert.ok(fs.existsSync(path.join(ROOT, 'grd', 'bin', 'grd-tools.cjs')), 'grd/bin/grd-tools.cjs must exist');
  });

  it('gsd-r-tools.cjs does not exist', () => {
    assert.ok(!fs.existsSync(path.join(ROOT, 'grd', 'bin', 'gsd-r-tools.cjs')), 'grd/bin/gsd-r-tools.cjs must not exist');
  });

});
