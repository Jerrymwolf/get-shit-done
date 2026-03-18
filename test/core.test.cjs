const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');

const {
  stripShippedMilestones,
  replaceInCurrentMilestone,
  resolveModelInternal,
} = require('../grd/bin/lib/core.cjs');

// --- stripShippedMilestones ---

describe('stripShippedMilestones', () => {
  it('removes a single <details> block', () => {
    const input = 'before\n<details>\nshipped content\n</details>\nafter';
    const result = stripShippedMilestones(input);
    assert.ok(!result.includes('<details>'));
    assert.ok(result.includes('before'));
    assert.ok(result.includes('after'));
  });

  it('removes multiple <details> blocks', () => {
    const input = '<details>a</details>middle<details>b</details>end';
    const result = stripShippedMilestones(input);
    assert.equal(result, 'middleend');
  });

  it('returns content unchanged when no details blocks', () => {
    const input = 'no details here';
    assert.equal(stripShippedMilestones(input), input);
  });

  it('is case-insensitive', () => {
    const input = 'x<Details>stuff</Details>y';
    assert.equal(stripShippedMilestones(input), 'xy');
  });
});

// --- replaceInCurrentMilestone ---

describe('replaceInCurrentMilestone', () => {
  it('replaces only after last </details>', () => {
    const content = '<details>- [ ] old</details>\n- [ ] Phase 10';
    const result = replaceInCurrentMilestone(content, '- [ ] Phase 10', '- [x] Phase 10');
    assert.ok(result.includes('- [x] Phase 10'));
    assert.ok(result.includes('<details>- [ ] old</details>'));
  });

  it('replaces everywhere when no details blocks', () => {
    const content = '- [ ] Phase 10\n- [ ] Phase 11';
    const result = replaceInCurrentMilestone(content, /- \[ \] Phase 10/, '- [x] Phase 10');
    assert.ok(result.includes('- [x] Phase 10'));
  });

  it('does not modify text inside details blocks', () => {
    const content = '<details>MATCH</details>\nafter MATCH';
    const result = replaceInCurrentMilestone(content, 'MATCH', 'REPLACED');
    assert.ok(result.includes('<details>MATCH</details>'));
    assert.ok(result.includes('after REPLACED'));
  });
});

// --- resolveModelInternal - inherit profile ---

describe('resolveModelInternal - inherit profile', () => {
  it('returns inherit when profile is inherit', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'core-test-'));
    fs.mkdirSync(path.join(tmpDir, '.planning'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.planning', 'config.json'), JSON.stringify({ model_profile: 'inherit' }));
    const result = resolveModelInternal(tmpDir, 'grd-executor');
    assert.equal(result, 'inherit');
    fs.rmSync(tmpDir, { recursive: true });
  });

  it('normalizes mixed-case profile to lowercase', () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'core-test-'));
    fs.mkdirSync(path.join(tmpDir, '.planning'), { recursive: true });
    fs.writeFileSync(path.join(tmpDir, '.planning', 'config.json'), JSON.stringify({ model_profile: 'Balanced' }));
    const result = resolveModelInternal(tmpDir, 'grd-executor');
    assert.equal(result, 'sonnet'); // grd-executor balanced = sonnet
    fs.rmSync(tmpDir, { recursive: true });
  });
});
