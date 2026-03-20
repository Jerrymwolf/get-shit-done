const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const SCOPE_PATH = path.join(__dirname, '..', 'grd', 'workflows', 'scope-inquiry.md');

describe('Scope Inquiry Flags (Phase 18)', () => {
  const content = fs.readFileSync(SCOPE_PATH, 'utf8');

  describe('TRAP-01: --prd flag', () => {
    it('documents --prd flag parsing', () => {
      assert.ok(content.includes('--prd'), 'Missing --prd flag documentation');
    });
    it('describes research-adapted parsing', () => {
      assert.ok(content.includes('inclusion criteria') || content.includes('Inclusion criteria'),
        'Missing inclusion criteria in --prd description');
    });
    it('describes search boundaries parsing', () => {
      assert.ok(content.includes('search boundaries') || content.includes('Search boundaries'),
        'Missing search boundaries in --prd description');
    });
    it('describes disciplinary scope parsing', () => {
      assert.ok(content.includes('disciplinary scope') || content.includes('Disciplinary scope'),
        'Missing disciplinary scope in --prd description');
    });
    it('--prd generates CONTEXT.md without interaction', () => {
      assert.ok(content.includes('WITHOUT user interaction') || content.includes('without user interaction'),
        '--prd should skip interactive mode');
    });
  });

  describe('TRAP-01: --batch flag', () => {
    it('documents --batch flag', () => {
      assert.ok(content.includes('--batch'), 'Missing --batch flag');
    });
    it('accepts --batch N format', () => {
      assert.ok(content.includes('--batch N') || content.includes('--batch=N'),
        'Missing --batch N format');
    });
  });

  describe('Express path', () => {
    it('references research brief not PRD', () => {
      assert.ok(content.includes('research brief') || content.includes('protocol document'),
        'Express path should reference research brief, not generic PRD');
    });
  });
});
