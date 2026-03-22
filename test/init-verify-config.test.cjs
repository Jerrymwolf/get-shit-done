const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const { execFileSync } = require('child_process');
const path = require('path');

const cwd = path.resolve(__dirname, '..');
const tool = path.join(cwd, 'grd', 'bin', 'grd-tools.cjs');

function initVerifyInquiry(phase) {
  const out = execFileSync('node', [tool, 'init', 'verify-inquiry', phase, '--raw'], { cwd, encoding: 'utf-8' });
  return JSON.parse(out);
}

describe('cmdInitVerifyWork temporal_positioning propagation', () => {
  // These tests rely on the project's current config.json which has review_type: narrative
  // Narrative's smart default for temporal_positioning is 'optional'

  it('returns temporal_positioning as boolean, not raw config value', () => {
    const result = initVerifyInquiry('23');
    assert.equal(typeof result.temporal_positioning, 'boolean');
  });

  it('narrative review type returns temporal_positioning false (optional means disabled)', () => {
    const result = initVerifyInquiry('23');
    // narrative smart default: temporal_positioning = 'optional'
    // 'optional' !== false is true, but 'optional' !== 'optional' is false → AND → false
    assert.equal(result.temporal_positioning, false);
  });

  it('returns review_type from config', () => {
    const result = initVerifyInquiry('23');
    assert.ok(['systematic', 'scoping', 'integrative', 'critical', 'narrative'].includes(result.review_type));
  });

  it('returns epistemological_stance from config', () => {
    const result = initVerifyInquiry('23');
    assert.ok(['positivist', 'constructivist', 'pragmatist', 'critical'].includes(result.epistemological_stance));
  });

  it('returns researcher_tier from config', () => {
    const result = initVerifyInquiry('23');
    assert.ok(['guided', 'standard', 'expert'].includes(result.researcher_tier));
  });
});

describe('cmdInitVerifyWork does not read config.workflow nested path', () => {
  it('temporal_positioning is not always true (the old bug)', () => {
    // The old code was: config.workflow?.temporal_positioning !== false
    // Since loadConfig returns temporal_positioning at top level,
    // config.workflow?.temporal_positioning was always undefined,
    // and undefined !== false is true — so it was always true.
    // After the fix, narrative/integrative/critical should return false.
    const result = initVerifyInquiry('23');
    // This project uses narrative review type → temporal_positioning should be false
    if (result.review_type === 'narrative' || result.review_type === 'integrative' || result.review_type === 'critical') {
      assert.equal(result.temporal_positioning, false,
        `${result.review_type} review type should have temporal_positioning=false (optional means disabled)`);
    }
  });
});
